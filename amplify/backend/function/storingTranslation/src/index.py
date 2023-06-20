import boto3
import json
import bs4 as bs
from copy import deepcopy

# Get the service resource.
lambda_connection = boto3.client('lambda')
# S3 connection
s3_connection = boto3.client('s3')
# DynamoDB connection
dynamodb_connection = boto3.resource('dynamodb')
# DynamoDB table name
table = dynamodb_connection.Table('translations-aws-blog-posts')

translate = boto3.client('translate')

def lambda_handler(event, context):
    # bucket that will be used to store the file
    BUCKET = 'english-turkish-translations-2'
    #get url from event
    URL = event['url']
    #create file name from url (this is our key)

    # if url ends with a /, remove it
    if URL[-1] == '/':
        URL = URL[:-1]
    
    print(URL)

    FILE_NAME = URL.split('/')[-1]
    #first check if the entry exists in the db
    response = table.get_item(Key={'URL': FILE_NAME})
    #pass the url to the lhs lambda to get back html
    try:
        if 'Item' not in response:
            lhs_html, lhs_authors, lhs_title = get_html(URL, 'getBlogContent-storagedev')

    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'problem with LHS lambda',
        }
    # store the html in s3
    try:
        s3_connection.put_object(Bucket=BUCKET, Key=FILE_NAME + '-lhs'+'.html', Body=lhs_html.encode())
        rhs_name = FILE_NAME + '[translated]' + event['targetLanguage']['code'] + '-' + event['translationModel']['type'] +  '-rhs'+'.html'
        with open('/tmp/'+rhs_name, 'w+') as f:
            f.write(translate_text(lhs_html).prettify())
        s3_connection.put_object(Bucket=BUCKET, Key=rhs_name, Body=open('/tmp/'+rhs_name, 'rb'))
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'problem with S3 or RHS lambda',
        }

    #update the db

    # # if the file doesn't exist, add it to the db

    # # the db has the following fields:
    # # URL: the url of the file
    # # average_rating: the average rating of the file
    # # number_of_ratings: the number of ratings the file has
    # # ratings, a separate table that contains the ratings for the file
    if 'Item' not in response:
        table.put_item(
            Item={
                'URL': FILE_NAME,
                'authors': lhs_authors,
                'title': lhs_title,
                'language' : event['sourceLanguage']['code'],
                'LHS_s3_loc': 'https://s3.amazonaws.com/' + BUCKET + '/' + FILE_NAME + '-lhs.html'
            }
        )
    table.put_item (
        Item={
            'URL': FILE_NAME + '[translated]' + event['targetLanguage']['code'] + '-' + event['translationModel']['type'],
            'originalBlog' : FILE_NAME,
            'average_rating': 0,
            'number_of_ratings': 0,
            'authors': lhs_authors,
            'title': lhs_title,
            # 'LHS_s3_loc': 'https://s3.amazonaws.com/' + BUCKET + '/' + FILE_NAME + '-lhs.html',
            'RHS_s3_loc': 'https://s3.amazonaws.com/' + BUCKET + '/' + FILE_NAME + '-rhs.html'
        }
    )
    return {
        'statusCode': 200,
        'body':'great success',
        'url': URL,
    }

#function to get html from url by calling a lambda
def get_html(url, sourceLanguage, targetLanguage, translationModel, lambda_name):
    try:
        #sends the url to the lambda that will get the html
        response = lambda_connection.invoke(
            FunctionName=lambda_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(
                {
                    "url" :  url,
                    "targetLanguage": {
                        "name": targetLanguage['name'],
                        "code": targetLanguage['code']
                    },
                    "sourceLanguage": {
                        "name": sourceLanguage['name'],
                        "code": sourceLanguage['code']
                    },
                    "translationModel": {
                        "type": translationModel['type']
                    }
                })
        )
        #get the html from the response
        response_json = json.load(response['Payload'])
        print(response_json)
    except Exception as e:
        raise e
    return response_json['file'], response_json['title'], response_json['author']

# {
#     "arguments": {
#         "input": {
#             "url": "https://aws.amazon.com/blogs/machine-learning/deploy-falcon-40b-with-large-model-inference-dlcs-on-amazon-sagemaker/?trk=bade69cc-1806-412a-8d8a-fb17a77100e4&sc_channel=el",
#             "targetLanguage": {
#                 "name": "TURKISH",
#                 "code": "tr"
#             },
#             "sourceLanguage": {
#                 "name": "ENGLISH",
#                 "code": "en"
#             },
#             "translationModel": {
#                 "type": "amazonTranslate"
#             }
#         }
#     }
# }

def get_translated(url, targetLanguage, sourceLanguage, translationModel):
    try:
        #sends the url to the lambda that will get the html
        response = lambda_connection.invoke(
            FunctionName= "UserConfigFunction-storagedev",
            InvocationType='RequestResponse',
            Payload=json.dumps(
            {
                "arguments": {
                    "input": {
                        "url": url,
                        "targetLanguage": {
                "name": targetLanguage['name'],
                "code": targetLanguage['code']
            },
            "sourceLanguage": {
                "name": sourceLanguage['name'],
                "code": sourceLanguage['code']
            },
            "translationModel": {
                "type": translationModel['type']
            }
        }
    },
}
                )
        )
        #get the html from the response
        response_json = json.load(response['Payload'])
        print(response_json)
    except Exception as e:
        raise e
    return response_json['author'], response_json['title'], response_json['content']
    


def translate_text(html):
    soup = bs.BeautifulSoup(html, 'html.parser')
    for t in soup.find_all(string=True):
        if t.parent.name != "script":
            t.replace_with(translate.translate_text(Text=t, SourceLanguageCode="en", TargetLanguageCode="tr")['TranslatedText'])
    return soup


lhs = {
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  },
  "file": "<div class=\"aws-blog-content lb-row lb-row-max-large lb-snap lb-gutter-mid\">\n <main class=\"lb-col lb-tiny-24 lb-mid-16\" id=\"aws-page-content-main\" role=\"main\" tabindex=\"-1\">\n  <h2 class=\"lb-h5 blog-title\">\n   <a href=\"https://aws.amazon.com/blogs/database/\">\n    AWS Database Blog\n   </a>\n  </h2>\n  <article class=\"blog-post\" typeof=\"TechArticle\" vocab=\"https://schema.org/\">\n   <meta content=\"en-US\" property=\"inLanguage\"/>\n   <meta content=\"https://d2908q01vomqb2.cloudfront.net/887309d048beef83ad3eabf2a79a64a389ab1c9f/2023/06/09/DBBLOG-2864-featured-images.jpg\" property=\"image\"/>\n   <h1 class=\"lb-h2 blog-post-title\" property=\"name headline\">\n    Install additional software components on Amazon RDS Custom for Oracle\n   </h1>\n   <footer class=\"blog-post-meta\" data-lb-comp=\"aws-blog:share-dialog\">\n    by\n    <span property=\"author\" typeof=\"Person\">\n     <span property=\"name\">\n      Jobin Joseph\n     </span>\n    </span>\n    | on\n    <time datetime=\"2023-06-09T12:14:57-07:00\" property=\"datePublished\">\n     09 JUN 2023\n    </time>\n    | in\n    <span class=\"blog-post-categories\">\n     <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-rds/amazon-rds-custom/\" title=\"View all posts in Amazon RDS Custom\">\n      <span property=\"articleSection\">\n       Amazon RDS Custom\n      </span>\n     </a>\n     ,\n     <a href=\"https://aws.amazon.com/blogs/database/category/learning-levels/expert-400/\" title=\"View all posts in Expert (400)\">\n      <span property=\"articleSection\">\n       Expert (400)\n      </span>\n     </a>\n     ,\n     <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-rds/rds-for-oracle/\" title=\"View all posts in RDS for Oracle\">\n      <span property=\"articleSection\">\n       RDS for Oracle\n      </span>\n     </a>\n    </span>\n    |\n    <a href=\"https://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/\" property=\"url\">\n     Permalink\n    </a>\n    |\n    <a href=\"https://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/#Comments\">\n     <i class=\"icon-comment\">\n     </i>\n     Comments\n    </a>\n    |\n    <a data-share-dialog-toggle=\"\" href=\"#\" role=\"button\">\n     <span class=\"span icon-share\">\n     </span>\n     Share\n    </a>\n    <div class=\"blog-share-dialog\" data-share-dialog=\"\" style=\"display: none;\">\n     <ul>\n      <li>\n       <a aria-label=\"Share on Facebook\" class=\"lb-txt\" href=\"https://www.facebook.com/sharer/sharer.php?u=https://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/\" rel=\"noopener noreferrer\" target=\"_blank\">\n        <span class=\"icon-facebook-square\">\n        </span>\n       </a>\n      </li>\n      <li>\n       <a aria-label=\"Share on Twitter\" class=\"lb-txt\" href=\"https://twitter.com/intent/tweet/?text=Install%20additional%20software%20components%20on%20Amazon%20RDS%20Custom%20for%20Oracle&amp;via=awscloud&amp;url=https://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/\" rel=\"noopener noreferrer\" target=\"_blank\">\n        <span class=\"icon-twitter-square\">\n        </span>\n       </a>\n      </li>\n      <li>\n       <a aria-label=\"Share on LinkedIn\" class=\"lb-txt\" href=\"https://www.linkedin.com/shareArticle?mini=true&amp;title=Install%20additional%20software%20components%20on%20Amazon%20RDS%20Custom%20for%20Oracle&amp;source=Amazon%20Web%20Services&amp;url=https://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/\" rel=\"noopener noreferrer\" target=\"_blank\">\n        <span class=\"icon-linkedin-square\">\n        </span>\n       </a>\n      </li>\n      <li>\n       <a aria-label=\"Share on Email\" class=\"lb-txt\" href=\"mailto:?subject=Install%20additional%20software%20components%20on%20Amazon%20RDS%20Custom%20for%20Oracle&amp;body=Install%20additional%20software%20components%20on%20Amazon%20RDS%20Custom%20for%20Oracle%0A%0Ahttps://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/\" rel=\"noopener noreferrer\" target=\"_blank\">\n        <span class=\"icon-envelope-square\">\n        </span>\n       </a>\n      </li>\n      <li class=\"blog-share-dialog-url\">\n       <input data-share-dialog-url=\"\" readonly=\"\" title=\"Link to Install additional software components on Amazon RDS Custom for Oracle\" type=\"text\" value=\"https://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/\"/>\n      </li>\n     </ul>\n    </div>\n   </footer>\n   <section class=\"blog-post-content lb-rtxt\" property=\"articleBody\">\n    <p>\n     <a href=\"https://aws.amazon.com/rds/custom/\" rel=\"noopener\" target=\"_blank\">\n      Amazon Relational Database Service (Amazon RDS) Custom\n     </a>\n     is a managed database service that provides the flexibility to customize your database, underlying server, and operating system configurations needed to support applications that require more control than what a typical managed relational database service provides. Amazon RDS Custom for Oracle is built for legacy, custom, packaged applications, and applications that require access to the underlying OS and DB environment.\n    </p>\n    <p>\n     When an RDS Custom for Oracle instance is provisioned, it comes with a database environment that consists mainly of database binaries, a starter database, and a database listener. For certain workloads, you may want to install additional software components provided by Oracle or other vendors on the host operating system of the database server.\n    </p>\n    <p>\n     With the flexibility of Amazon RDS Custom for Oracle, you can customize your database, underlying server, and operating system configurations to support the various requirements of the workload. In this post, we discuss the step-by-step instructions and best practices for installing common software components on Amazon RDS Custom for Oracle without breaking the\n     <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-troubleshooting.html#custom-troubleshooting.support-perimeter\" rel=\"noopener\" target=\"_blank\">\n      RDS Custom support perimeter\n     </a>\n     .\n    </p>\n    <h2>\n     Install additional software components and agents\n    </h2>\n    <p>\n     Installation of additional software and agents on the database host might be a requirement to satisfy various application needs or organization standards. Until Amazon RDS Custom was introduced, you had to deploy such workloads as self-managed databases on\n     <a href=\"https://aws.amazon.com/ec2/\" rel=\"noopener\" target=\"_blank\">\n      Amazon Elastic Compute Cloud\n     </a>\n     (Amazon EC2). Amazon RDS Custom for Oracle was launched to address such requirements for workloads that need more access and privileges than what is possible with\n     <a href=\"https://aws.amazon.com/rds/oracle/\" rel=\"noopener\" target=\"_blank\">\n      Amazon RDS for Oracle\n     </a>\n     .\n    </p>\n    <p>\n     Some of the common requirements that we hear from our customers with regards to the installation of software components on the database host include the following:\n    </p>\n    <ul>\n     <li>\n      Install Oracle Enterprise Manager (OEM) Agent on the database host to discover the database instance as a target in\n      <a href=\"https://docs.oracle.com/cd/E63000_01/EMCON/toc.htm\" rel=\"noopener\" target=\"_blank\">\n       Oracle Enterprise Manager Grid Control\n      </a>\n     </li>\n     <li>\n      Install APEX Listener on the database host to support the\n      <a href=\"https://apex.oracle.com/en/\" rel=\"noopener\" target=\"_blank\">\n       Oracle Application Express (APEX)\n      </a>\n      feature\n     </li>\n     <li>\n      Install an\n      <code>\n       S-TAP\n      </code>\n      agent on the database host as a root user to monitor the database traffic using the\n      <a href=\"https://www.ibm.com/docs/en/guardium\" rel=\"noopener\" target=\"_blank\">\n       Guardium\n      </a>\n      database activity monitoring solution\n     </li>\n    </ul>\n    <h2>\n     Best practices to install software components on an RDS Custom for Oracle environment\n    </h2>\n    <p>\n     The following are some of the best practices and guidelines when installing additional software components in the RDS Custom for Oracle environment:\n    </p>\n    <ul>\n     <li>\n      The recommended practice to apply database patches is to create a new\n      <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-cev.html\" rel=\"noopener\" target=\"_blank\">\n       custom engine version (CEV)\n      </a>\n      with the desired patches and apply the new CEV to the instance. However, when this approach isn’t feasible (for example, an emergency patching scenario), one-off patches may be directly applied on the\n      <code>\n       ORACLE_HOME\n      </code>\n      using the\n      <code>\n       OPatch\n      </code>\n      utility. Optionally, an updated CEV corresponding to the applied patches can be created and applied to the instance later to synchronize\n      <code>\n       ORACLE_HOME\n      </code>\n      and the CEV used by the instance, although the instance has no dependency on the CEV after it’s provisioned.\n     </li>\n     <li>\n      Do not install additional software components under the\n      <code>\n       /rdsdbbin\n      </code>\n      mount point, which is reserved for Oracle Database binaries.\n     </li>\n     <li>\n      It is recommended to install third-party software and agents as a separate OS user. Installing and running software components and agents as the root user is also supported. Software components related to Oracle Database such as OEM Agent and APEX Listener can be installed as the\n      <code>\n       rdsdb\n      </code>\n      user who owns the Oracle Database binaries.\n     </li>\n     <li>\n      Use the\n      <code>\n       /rdsdbdata\n      </code>\n      file system to host additional software components under new directories created on this mount point. Because this file system is included in automated and manual snapshot backups, it’s recommended to remove temporary staging files that are no longer required after successful installation of the software.\n     </li>\n     <li>\n      Configure the software for logs and trace files to be created on the\n      <code>\n       /rdsdbdata\n      </code>\n      file system and implement periodic purging of those files.\n     </li>\n     <li>\n      Tasks can be scheduled to run automatically using\n      <a href=\"https://docs.oracle.com/en/learn/oracle-linux-crontab/index.html#before-you-begin\" rel=\"noopener\" target=\"_blank\">\n       crontab\n      </a>\n      or auto start of the tasks, and agents can be configured using\n      <a href=\"https://docs.oracle.com/en/learn/use_systemd/#introduction\" rel=\"noopener\" target=\"_blank\">\n       systemd\n      </a>\n      .\n     </li>\n     <li>\n      To avoid space pressure on the\n      <code>\n       /mount\n      </code>\n      point, packages can be installed outside the\n      <code>\n       /mount\n      </code>\n      if the installer allows that option for the specific software that is installed. For instance, you can use\n      <code>\n       rpm -ivh --prefix=/rdsdbdata/software_additions\n      </code>\n      to install relocatable packages to the\n      <code>\n       /rdsdbdata\n      </code>\n      mount point.\n     </li>\n     <li>\n      Verify that installing new software components doesn’t break the library dependencies and kernel requirements for the Oracle Database binaries. Refer to the Oracle installation documentation corresponding to the database and OS version for more details. Refer to\n      <a href=\"https://docs.oracle.com/en/database/oracle/oracle-database/19/ladbi/supported-oracle-linux-7-distributions-for-x86-64.html#GUID-3E82890D-2552-4924-B458-70FFF02315F7\" rel=\"noopener\" target=\"_blank\">\n       Supported Oracle Linux 7 Distributions for x86-64\n      </a>\n      for the details for the 19c database on Oracle Linux 7.\n     </li>\n     <li>\n      Monitor RDS Custom for Oracle Elastic Block Store (EBS) mount points such as data volume (\n      <code>\n       /rdsdbdata\n      </code>\n      ), binary volume (\n      <code>\n       /rdsdbbin\n      </code>\n      ), and root volume (\n      <code>\n       /\n      </code>\n      ), as discussed in\n      <a href=\"https://aws.amazon.com/blogs/database/monitor-amazon-rds-custom-for-oracle-with-amazon-cloudwatch-metrics/\" rel=\"noopener\" target=\"_blank\">\n       Monitor Amazon RDS Custom for Oracle with Amazon CloudWatch metrics\n      </a>\n      , to verify that the installation and configuration of the software components doesn’t exhaust the space available on those volumes.\n     </li>\n     <li>\n      It is recommended to\n      <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-managing.html#custom-managing.pausing\" rel=\"noopener\" target=\"_blank\">\n       pause and resume automation\n      </a>\n      before and after the installation of additional software components on an RDS Custom for Oracle instance. This is to verify that the root volume gets backed up (during resume automation) after the software installation and restore activities including\n      <a href=\"https://aws.amazon.com/about-aws/whats-new/2022/08/amazon-rds-custom-oracle-scale-compute/\" rel=\"noopener\" target=\"_blank\">\n       scale compute\n      </a>\n      can use the latest image of the operating system.\n     </li>\n    </ul>\n    <p>\n     In this post, we also discuss the high-level steps to install Oracle APEX, the Guardium S-TAP agent, and OEM Agent on the host operating system of an RDS Custom for Oracle instance. The steps discussed here are for reference to provide an overview of the installation process in an RDS Custom for Oracle environment. Refer to the official documentation published by the vendors for detailed instructions for installing a specific version of those software components.\n    </p>\n    <p>\n     An OS login is needed for performing different activities involved in the installation process. Refer to\n     <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-creating.html#custom-creating.ssh\" rel=\"noopener\" target=\"_blank\">\n      Connecting to your RDS Custom DB instance using SSH\n     </a>\n     or\n     <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-creating.html#custom-creating.ssm\" rel=\"noopener\" target=\"_blank\">\n      Connecting to your RDS Custom DB instance using AWS Systems Manager\n     </a>\n     to choose your preferred connectivity to the RDS Custom for Oracle instance.\n    </p>\n    <p>\n     For installing software components on multiple RDS Custom for Oracle instances, the installation process can be simplified using\n     <a href=\"https://aws.amazon.com/systems-manager/\" rel=\"noopener\" target=\"_blank\">\n      AWS Systems Manager\n     </a>\n     documents. Refer to\n     <a href=\"https://aws.amazon.com/blogs/database/automate-tasks-in-amazon-rds-custom-for-oracle-using-aws-systems-manager-documents/\" rel=\"noopener\" target=\"_blank\">\n      Automate tasks in Amazon RDS Custom for Oracle using AWS Systems Manager documents\n     </a>\n     for details.\n    </p>\n    <h2>\n     Install APEX Listener on an RDS Custom for Oracle environment\n    </h2>\n    <p>\n     The steps detailed here are only for reference to show how installation can be done on an RDS Custom for Oracle environment. Refer to\n     <a href=\"https://docs.oracle.com/en/database/oracle/apex/22.1/htmig/downloading-installing-apex.html#GUID-B5A5B38D-586C-488A-AE27-A168FAA28FEE\" rel=\"noopener\" target=\"_blank\">\n      Downloading and Installing Oracle APEX\n     </a>\n     for detailed instructions on downloading and installing Oracle APEX depending on the APEX version.\n    </p>\n    <p>\n     The Oracle APEX architecture requires a webserver to proxy the requests between a browser and the APEX engine. Oracle REST Data Services (ORDS) meets this requirement, and this webserver component can be hosted on the database server or on a different EC2 instance that has connectivity to the RDS Custom for Oracle instance. The steps listed here are for installing the ORDS component on the same RDS Custom for Oracle instance that hosts the database component.\n    </p>\n    <ol>\n     <li>\n      <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-managing.html#custom-managing.pausing\" rel=\"noopener\" target=\"_blank\">\n       Pause RDS Custom automation\n      </a>\n     </li>\n     <li>\n      Download and install Oracle APEX (for this post, we installed APEX version 22, which can be downloaded from\n      <a href=\"https://download.oracle.com/otn_software/apex/apex_22.1.zip\" rel=\"noopener\" target=\"_blank\">\n       download.oracle.com\n      </a>\n      ).\n     </li>\n    </ol>\n    <ul>\n     <li>\n      Create a directory named\n      <code>\n       software_addons\n      </code>\n      in the\n      <code>\n       /rdsdbdata\n      </code>\n      mount point to host the additional software components and set the appropriate permissions:\n     </li>\n    </ul>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">root&gt;mkdir -p /rdsdbdata/sofware_addons\nroot&gt;chmod a+w /rdsdbdata/sofware_addons\n</code></pre>\n    </div>\n    <ul>\n     <li>\n      Download the APEX installation file and install the APEX component in the database:\n     </li>\n    </ul>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">rdsdb&gt;cd /rdsdbdata/sofware_addons\nmkdir apex\ncd apex\nwget https://download.oracle.com/otn_software/apex/apex_22.1.zip\nunzip apex_22.1.zip\ncd /rdsdbdata/sofware_addons/apex/apex\n\nsqlplus \"/ as sysdba\"\n-- Install APEX full development environment.\nSQL&gt;@apexins.sql SYSAUX SYSAUX TEMP /i/\n\n-- Exit and reconnect as sysdba\nsqlplus \"/ as sysdba\"\n-- Create Administrator account\nSQL&gt;@apxchpwd.sql\n\nExit and reconnect as sysdba \nSQL&gt;ALTER USER APEX_PUBLIC_USER IDENTIFIED BY &lt;password&gt; account unlock;\n\nConfigure RESTful services\nSQL&gt;@apex_rest_config.sql\n</code></pre>\n    </div>\n    <ol start=\"3\">\n     <li>\n      Download and install ORDS (see\n      <a href=\"https://docs.oracle.com/en/database/oracle/apex/22.1/htmig/downloading-installing-ords.html\" rel=\"noopener\" target=\"_blank\">\n       Downloading and Installing Oracle REST Data Services\n      </a>\n      for detailed installation steps):\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">rdsdb&gt;\nmkdir -p /rdsdbdata/sofware_addons/apex/ords\ncd /rdsdbdata/sofware_addons/apex/ords\nwget https://download.oracle.com/otn_software/java/ords/ords-latest.zip\n\nunzip ords-latest.zip\ncp -rp /rdsdbdata/sofware_addons/apex/apex/images/ .\n</code></pre>\n    </div>\n    <ol start=\"4\">\n     <li>\n      Download\n      <a href=\"https://www.oracle.com/java/technologies/downloads/#java11\" rel=\"noopener\" target=\"_blank\">\n       Java 11\n      </a>\n      or higher version as required by ORDS:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">rdsdb&gt;mkdir -p /rdsdbdata/sofware_addons/java11\ncd /rdsdbdata/sofware_addons/java11\ntar zxvf  jdk-11.0.17_linux-x64_bin.tar.gz\n</code></pre>\n    </div>\n    <p>\n     As per the Oracle blog post\n     <a href=\"https://blogs.oracle.com/database/post/apex-ords-futc\" rel=\"noopener\" target=\"_blank\">\n      Oracle APEX and ORDS now under the Oracle Free Use Terms and Conditions license\n     </a>\n     , APEX and ORDS do not require additional licensing. Verify your license terms and conditions with Oracle to confirm the licensing implications of using JRE for ORDS.\n    </p>\n    <ol start=\"5\">\n     <li>\n      Provide ORDS installation privileges to the ADMIN user:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre class=\"unlimited-height-code\"><code class=\"lang-bash\">rdsdb&gt;sqlplus / as sysdba\n\nSQL&gt;@/rdsdbdata/sofware_addons/apex/ords/scripts/installer/ords_installer_privileges.sql ADMIN\n</code></pre>\n    </div>\n    <ol start=\"6\">\n     <li>\n      Prepare an environment file to set PATH for Java and ORDS binaries:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">cat ords.env\nexport PATH=/rdsdbdata/sofware_addons/java11/jdk-11.0.17/bin:$PATH:/rdsdbdata/sofware_addons/apex/ords/bin\n\n. ords.env\n\n</code></pre>\n    </div>\n    <ol start=\"7\">\n     <li>\n      Configure and start ORDS (for more information, refer to\n      <a href=\"https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/22.1/ordig/installing-and-configuring-oracle-rest-data-services.html#GUID-6076DC47-0218-4B37-91E2-FA7D4BA1F834\" rel=\"noopener\" target=\"_blank\">\n       Downloading ORDS\n      </a>\n      ):\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">ords --config /rdsdbdata/sofware_addons/apex/ords/config install\n\nOnce the installation is completed you can check the APEX using a browser or wget.\n\nwget localhost:8080\nif you get the following message then remove the line “&lt;entry key=\"security.requestValidationFunction\"&gt;ords_util.authorize_plsql_gateway&lt;/entry&gt;” from /rdsdbdata/sofware_addons/apex/ords/config/databases/default/pool.xml and restart ORDS.\n\nHTTP request sent, awaiting response... 404 Not Found\n2022-11-09 04:04:06 ERROR 404: Not Found.\n\n\nrdsdb&gt;ords  --config /rdsdbdata/sofware_addons/apex/ords/config serve\n\nrdsdb&gt;wget localhost:8080\n\nReusing existing connection to [localhost]:8080.\nHTTP request sent, awaiting response... 200 OK\nLength: unspecified [text/html]\nSaving to: ‘index.html’\n</code></pre>\n    </div>\n    <p>\n     You can use\n     <a href=\"https://docs.oracle.com/en/learn/use_systemd/\" rel=\"noopener\" target=\"_blank\">\n      systemd\n     </a>\n     to configure auto start of the ORDS component when the EC2 instance reboots.\n    </p>\n    <ol start=\"8\">\n     <li>\n      <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-managing.html#custom-managing.pausing\" rel=\"noopener\" target=\"_blank\">\n       Resume RDS Custom automation\n      </a>\n     </li>\n    </ol>\n    <h2>\n     Install the Guardium S-TAP agent on an RDS Custom for Oracle environment\n    </h2>\n    <p>\n     Guardium is a comprehensive data protection service that enables security teams to automatically analyze what is happening in sensitive data environments like databases. Many customers use Guardium for database activity monitoring, and it requires the S-TAP agent to be installed on the database servers. Guardium S-TAP is a lightweight software agent installed on database servers for data activity monitoring. The information collected by the S-TAP agent is forwarded to the Guardium collector. It is beyond the scope of this post to discuss the detailed installation steps for S-TAP or the features and configurations of the product. Refer to\n     <a href=\"https://www.ibm.com/docs/en/guardium/10.5?topic=overview-guardium\" rel=\"noopener\" target=\"_blank\">\n      IBM Guardium\n     </a>\n     for further details and architecture of Guardium.\n    </p>\n    <p>\n     The installation steps for S-TAP on Linux are discussed in detail in\n     <a href=\"https://www.ibm.com/docs/en/guardium/10.5?topic=tap-linux-unix-installing-s-agent-rpm\" rel=\"noopener\" target=\"_blank\">\n      Linux-Unix: Installing the S-TAP agent with RPM\n     </a>\n     .\n    </p>\n    <p>\n     In this section, we highlight the best practices to follow in an RDS Custom for Oracle environment during the installation of the S-TAP agent.\n    </p>\n    <ol>\n     <li>\n      <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-managing.html#custom-managing.pausing\" rel=\"noopener\" target=\"_blank\">\n       Pause RDS Custom automation\n      </a>\n     </li>\n     <li>\n      Prepare the installation directories. S-TAP agent gets installed to the\n      <code>\n       /opt/Guardium\n      </code>\n      directory, which can’t be customized. Due to limited space available in the\n      <code>\n       /\n      </code>\n      mount point, it’s recommended to create a guardium directory in the\n      <code>\n       /rdsdbdata/\n      </code>\n      mount point and create a soft link to\n      <code>\n       /opt/guardium\n      </code>\n      . See the following code:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">root&gt;mkdir -p /rdsdbdata/sofware_addons/Guardium/guardium\n\nroot&gt;ln -s /rdsdbdata/sofware_addons/Guardium/guardium /opt/guardium\n\nroot&gt;cd /rdsdbdata/sofware_addons/Guardium\n</code></pre>\n    </div>\n    <ol start=\"3\">\n     <li>\n      Install any prerequisites RPM files:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">root&gt;yum install ed</code></pre>\n    </div>\n    <ol start=\"4\">\n     <li>\n      Copy the installation RPM to the RDS Custom for Oracle instance to the\n      <code>\n       /rdsdbdata/sofware_addons/Guardium\n      </code>\n      directory and install the S-TAP agent:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">root&gt;export NI_ALLOW_MODULE_COMBOS=\"Y\"\nroot&gt;rpm -i guard-stap-11.5.0.0.113097-1-rhel-7-linux-x86_64.x86_64.rpm\n</code></pre>\n    </div>\n    <ol start=\"5\">\n     <li>\n      Complete the configuration by running\n      <code>\n       /opt/guardium/bin/guard-config-update\n      </code>\n      , as discussed in\n      <a href=\"https://www.ibm.com/docs/en/SSMPHH_10.5.0/com.ibm.guardium.doc.stap/stap/unix_native_stap_parameters.html\" rel=\"noopener\" target=\"_blank\">\n       Linux-Unix: S-TAP guard-config-update parameters for RPM installation and update\n      </a>\n      .\n     </li>\n     <li>\n      Auto start the S-TAP agent when the system reboot is automatically configured. Refer to the\n      <a href=\"https://www.ibm.com/docs/en/guardium/11.2?topic=agents-s-tap-does-not-start-automatically-linux\" rel=\"noopener\" target=\"_blank\">\n       troubleshooting guide\n      </a>\n      for more details.\n     </li>\n     <li>\n      <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-managing.html#custom-managing.pausing\" rel=\"noopener\" target=\"_blank\">\n       Resume RDS Custom automation\n      </a>\n     </li>\n    </ol>\n    <h2>\n     Install OEM Agent on an RDS Custom for Oracle environment\n    </h2>\n    <p>\n     Oracle Enterprise Manager (OEM) Management Agent is a software component that monitors targets running on hosts and communicates that information to the middle-tier Oracle Management Service (OMS). For more information, see\n     <a href=\"http://docs.oracle.com/cd/E24628_01/doc.121/e25353/overview.htm\" rel=\"noopener\" target=\"_blank\">\n      Overview of Oracle Enterprise Manager Cloud Control 12c\n     </a>\n     and\n     <a href=\"http://docs.oracle.com/cd/E63000_01/EMCON/overview.htm#EMCON109\" rel=\"noopener\" target=\"_blank\">\n      Overview of Oracle Enterprise Manager Cloud Control 13c\n     </a>\n     . To install OEM Agent on RDS Custom for Oracle, see the following steps:\n    </p>\n    <ol>\n     <li>\n      Prepare security group rules and firewall rules to allow required communication between OMS servers and OEM Agent, which will be deployed on the RDS Custom for Oracle instance. Refer to\n      <a href=\"https://docs.oracle.com/cd/E63000_01/EMADV/firewalls.htm#EMADV625\" rel=\"noopener\" target=\"_blank\">\n       Configuring Enterprise Manager for Firewalls\n      </a>\n      for more details on the ports for communication between them.\n     </li>\n     <li>\n      Get the agent installation file from OMS.\n     </li>\n    </ol>\n    <p>\n     There are multiple options to install OEM Agent on the RDS Custom for Oracle instance from OMS, as discussed in\n     <a href=\"https://docs.oracle.com/cd/E63000_01/EMBSC/install_agent_new.htm#EMBSC181\" rel=\"noopener\" target=\"_blank\">\n      Installing Oracle Management Agents 13c Release 1\n     </a>\n     . The example steps here use the\n     <code>\n      emcli get_agentimage\n     </code>\n     option to download the agent deployment file, which can be copied to the RDS Custom for Oracle instance. On the OMS server, run the following code:\n    </p>\n    <p>\n     <em>\n     </em>\n     <span style=\"background-color: #f2f4f5;color: #222222;font-family: Consolas, Monaco, monospace\">\n      ./emcli login -username=sysman\n     </span>\n    </p>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">./emcli get_supported_platforms\n./emcli get_agentimage -destination=/tmp/agentinstaller -platform=”Linux x86-64″\n</code></pre>\n    </div>\n    <ol start=\"3\">\n     <li>\n      Copy the agent installation file to the RDS Custom for Oracle instance.\n     </li>\n    </ol>\n    <p>\n     You can use SCP to copy to an\n     <a href=\"http://aws.amazon.com/s3\" rel=\"noopener\" target=\"_blank\">\n      Amazon Simple Storage Service\n     </a>\n     (Amazon S3) bucket or\n     <a href=\"https://aws.amazon.com/efs/\" rel=\"noopener\" target=\"_blank\">\n      Amazon Elastic File System\n     </a>\n     (Amazon EFS) integration to copy the installation files to RDS Custom for Oracle instance. For more information about this integration, refer to\n     <a href=\"https://aws.amazon.com/blogs/database/integrate-amazon-rds-custom-for-oracle-with-amazon-efs/\" rel=\"noopener\" target=\"_blank\">\n      Integrate Amazon RDS Custom for Oracle with Amazon EFS\n     </a>\n     .\n    </p>\n    <ol start=\"4\">\n     <li>\n      <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-managing.html#custom-managing.pausing\" rel=\"noopener\" target=\"_blank\">\n       Pause RDS Custom automation\n      </a>\n     </li>\n     <li>\n      Prepare the environment and install the agent:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">rdsdb&gt;mkdir -p /rdsdbdata/software_addons/agent_software\ncopy the agent installation file to  /rdsdbdata/software_addons/agent_software\n</code></pre>\n    </div>\n    <ol start=\"6\">\n     <li>\n      Create\n      <code>\n       AGENT HOME:\n      </code>\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">rdsdb&gt;mkdir -p /rdsdbdata/software_addons/agent_13c</code></pre>\n    </div>\n    <ol start=\"7\">\n     <li>\n      Create the file\n      <code>\n       /rdsdbdata/software_addons/agent/oraInst.loc\n      </code>\n      with the following contents:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">inventory_loc=/rdsdbbin/oraInventory\ninst_group=rdsdb\n</code></pre>\n    </div>\n    <ol start=\"8\">\n     <li>\n      Install the agent (modify the configurations to match your environment):\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre class=\"unlimited-height-code\"><code class=\"lang-bash\">cd /rdsdbdata/software_addons/agent_software\n\n./agentDeploy.sh AGENT_BASE_DIR=/rdsdbdata/software_addons/agent13c \\\n-force \\\n-ignorePrereqs \\\n-invPtrLoc /rdsdbdata/software_addons/agent/oraInst.loc \\\nAGENT_PORT=3872 \\\nEM_UPLOAD_PORT=4903 \\\nOMS_HOST=10.0.2.51 \\\nORACLE_HOSTNAME=ip-10-0-3-211 \\\nAGENT_INSTANCE_HOME=/rdsdbdata/software_addons/agent13c/agent_inst \\\nAGENT_REGISTRATION_PASSWORD=password \\\nSCRATCHPATH=/tmp\n</code></pre>\n    </div>\n    <ol start=\"9\">\n     <li>\n      Run root.sh:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">root&gt; sh /rdsdbdata/software_addons/agent13c/agent_13.5.0.0.0/root.sh</code></pre>\n    </div>\n    <ol start=\"10\">\n     <li>\n      After the installation is successfully complete, verify that the agent is healthy:\n     </li>\n    </ol>\n    <div class=\"hide-language\">\n     <pre><code class=\"lang-bash\">rdsdb&gt;/rdsdbdata/software_addons/agent13c/agent_inst/bin/emctl status agent\n.\n.\n.\nCollection Status                            : Collections enabled\nHeartbeat Status                             : Ok\nLast attempted heartbeat to OMS              : 2022-11-22 13:48:37\nLast successful heartbeat to OMS             : 2022-11-22 13:48:37\nNext scheduled heartbeat to OMS              : 2022-11-22 13:49:37\n\n---------------------------------------------------------------\nAgent is Running and Ready\n\n/rdsdbdata/software_addons/agent13c/agent_inst/bin/emctl upload agent\nOracle Enterprise Manager Cloud Control 13c Release 5\nCopyright (c) 1996, 2021 Oracle Corporation.  All rights reserved.\n---------------------------------------------------------------\nEMD upload completed successfully\n</code></pre>\n    </div>\n    <p>\n     By default, the agent is configured to start automatically using the\n     <code>\n      /etc/init.d/gcstartup\n     </code>\n     script, as discussed in\n     <a href=\"https://docs.oracle.com/en/enterprise-manager/cloud-control/enterprise-manager-cloud-control/13.4/emadv/understanding-basics.html#GUID-83E8762E-AB03-4F2D-895F-43B14D0A28E6\" rel=\"noopener\" target=\"_blank\">\n      Understanding the Startup Scripts\n     </a>\n     .\n    </p>\n    <ol start=\"11\">\n     <li>\n      Confirm that the host target (the hostname of the RDS Custom for Oracle instance) is visible in OEM.\n     </li>\n    </ol>\n    <p>\n     <img alt=\"\" class=\"alignnone wp-image-34916 size-full\" height=\"327\" src=\"https://d2908q01vomqb2.cloudfront.net/887309d048beef83ad3eabf2a79a64a389ab1c9f/2023/06/01/DBBLOG-2864-OEM.png\" width=\"1867\"/>\n    </p>\n    <ol start=\"12\">\n     <li>\n      Add RDS Custom for Oracle instance\n      <a href=\"https://docs.oracle.com/cd/E63000_01/EMADM/discovery_db.htm#EMADM15517\" rel=\"noopener\" target=\"_blank\">\n       targets\n      </a>\n      such as database and listener to the OEM using the Amazon RDS console.\n     </li>\n     <li>\n      <a href=\"https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/custom-managing.html#custom-managing.pausing\" rel=\"noopener\" target=\"_blank\">\n       Resume RDS Custom automation\n      </a>\n     </li>\n    </ol>\n    <h2>\n     Clean up\n    </h2>\n    <p>\n     When the installation of the software components is successfully completed, clean up the installation files and temporary files that are no longer needed for the functioning of the software. This includes files such as\n     <code>\n      apex_22.1.zip, ords-latest.zip, jdk-11.0.17_linux-x64_bin.tar.gz, and guard-stap-11.5.0.0.113097-1-rhel-7-linux-x86_64.x86_64.rpm\n     </code>\n     which were staged for the installation of various components as discussed in this post.\n    </p>\n    <h2>\n     Conclusion\n    </h2>\n    <p>\n     If your workload requires the installation of additional software modules or agents on the database host and a managed service is preferred to run the Oracle Database workload, then Amazon RDS Custom for Oracle is your choice. In this post, we discussed the step-by-step instructions for installing common software components such as OEM Agent, APEX, and the Guardium S-TAP agent on Amazon RDS Custom for Oracle without breaking the support perimeter, and general best practices for software installation on an RDS Custom for Oracle instance.\n    </p>\n    <p>\n     If you have any comments or questions, leave them in the comments section.\n    </p>\n    <hr/>\n    <h3>\n     About the authors\n    </h3>\n    <p>\n     <img alt=\"\" class=\"size-full wp-image-33107 alignleft\" height=\"133\" loading=\"lazy\" src=\"https://d2908q01vomqb2.cloudfront.net/887309d048beef83ad3eabf2a79a64a389ab1c9f/2023/04/28/jobin.jpg\" width=\"100\"/>\n    </p>\n    <p>\n     <strong>\n      Jobin Joseph\n     </strong>\n     is a Senior Database Specialist Solution Architect based in Toronto. With a focus on relational database engines, he assists customers in migrating and modernizing their database workloads to AWS. He is an Oracle Certified Master with 20 years of experience with Oracle databases.\n    </p>\n    <!-- '\"` -->\n   </section>\n   <footer>\n   </footer>\n   <aside class=\"blog-comments\">\n    <h2 id=\"Comments\">\n     Comments\n    </h2>\n    <div class=\"blog-commenting\" data-comment-url=\"https://commenting.awsblogs.com/embed-1.0.html?disqus_shortname=aws-databaseblog&amp;disqus_identifier=34912&amp;disqus_title=Install+additional+software+components+on+Amazon+RDS+Custom+for+Oracle&amp;disqus_url=https://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/\" data-lb-comp=\"aws-blog:commenting\" data-origin=\"https://commenting.awsblogs.com\" data-sandbox-attr=\"allow-forms allow-scripts allow-popups allow-same-origin\">\n     <p>\n      <a href=\"https://commenting.awsblogs.com/embed-1.0.html?disqus_shortname=aws-databaseblog&amp;disqus_identifier=34912&amp;disqus_title=Install+additional+software+components+on+Amazon+RDS+Custom+for+Oracle&amp;disqus_url=https://aws.amazon.com/blogs/database/install-additional-software-components-on-amazon-rds-custom-for-oracle/\" property=\"discussionUrl\">\n       View Comments\n      </a>\n     </p>\n    </div>\n   </aside>\n   <div class=\"js-mbox\" data-mbox=\"en_blog_post_comments\">\n   </div>\n  </article>\n </main>\n <div class=\"blog-sidebar lb-col lb-tiny-24 lb-mid-8\">\n  <div class=\"awsm\">\n   <div class=\"lb-box\" style=\"padding-left:30px;\">\n    <h3 class=\"lb-txt-none lb-h3 lb-title\" id=\"Resources\" style=\"margin-top:30px;\">\n     Resources\n    </h3>\n    <div class=\"data-attr-wrapper lb-none-pad lb-none-v-margin lb-box\" data-da-campaign=\"acq_awsblogsb\" data-da-channel=\"ha\" data-da-content=\"database-resources\" data-da-language=\"en\" data-da-placement=\"blog-sb-resources\" data-da-trk=\"blog_initial\" data-da-type=\"ha\">\n     <ul class=\"lb-txt-none lb-ul lb-list-style-none lb-li-none-v-margin lb-tiny-ul-block\">\n      <li>\n       <a href=\"https://aws.amazon.com/getting-started?sc_ichannel=ha&amp;sc_icampaign=acq_awsblogsb&amp;sc_icontent=database-resources\">\n        Getting Started\n       </a>\n      </li>\n      <li>\n       <a href=\"https://aws.amazon.com/new?sc_ichannel=ha&amp;sc_icampaign=acq_awsblogsb&amp;sc_icontent=database-resources\">\n        What's New\n       </a>\n      </li>\n     </ul>\n     <div class=\"lb-grid lb-row lb-row-max-large lb-snap\">\n      <div class=\"lb-col lb-tiny-24 lb-mid-8\">\n       <hr class=\"lb-divider\"/>\n      </div>\n      <div class=\"lb-col lb-tiny-24 lb-mid-8\">\n      </div>\n      <div class=\"lb-col lb-tiny-24 lb-mid-8\">\n      </div>\n     </div>\n     <h3 class=\"lb-txt-none lb-h3 lb-title\" id=\"Blog_Topics\" style=\"margin-top:30px;\">\n      Blog Topics\n     </h3>\n     <div class=\"data-attr-wrapper lb-none-pad lb-none-v-margin lb-box\" data-da-campaign=\"acq_awsblogsb\" data-da-channel=\"ha\" data-da-content=\"database-social\" data-da-language=\"en\" data-da-placement=\"blog-sb-social\" data-da-trk=\"blog_initial\" data-da-type=\"ha\">\n      <ul class=\"lb-txt-none lb-ul lb-list-style-none lb-li-none-v-margin lb-tiny-ul-block\">\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-aurora/\">\n         Amazon Aurora\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-document-db/\">\n         Amazon DocumentDB\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-dynamodb/\">\n         Amazon DynamoDB\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-elasticache/\">\n         Amazon ElastiCache\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-managed-apache-cassandra-service/\">\n         Amazon Keyspaces (for Apache Cassandra)\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/blockchain/amazon-managed-blockchain/\">\n         Amazon Managed Blockchain\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-memorydb-for-redis/\">\n         Amazon MemoryDB for Redis\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-neptune/\">\n         Amazon Neptune\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-quantum-ledger-database/\">\n         Amazon Quantum Ledger Database (Amazon QLDB)\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-rds/\">\n         Amazon RDS\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/amazon-timestream/\">\n         Amazon Timestream\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/aws-database-migration-service/\">\n         AWS Database Migration Service\n        </a>\n       </li>\n       <li>\n        <a href=\"https://aws.amazon.com/blogs/database/category/database/aws-schema-conversion-tool/\">\n         AWS Schema Conversion Tool\n        </a>\n       </li>\n      </ul>\n      <div class=\"lb-grid lb-row lb-row-max-large lb-snap\">\n       <div class=\"lb-col lb-tiny-24 lb-mid-8\">\n        <hr class=\"lb-divider\"/>\n       </div>\n       <div class=\"lb-col lb-tiny-24 lb-mid-8\">\n       </div>\n       <div class=\"lb-col lb-tiny-24 lb-mid-8\">\n       </div>\n      </div>\n     </div>\n    </div>\n    <h3 class=\"lb-txt-none lb-h3 lb-title\" id=\"Follow\">\n     Follow\n    </h3>\n    <div class=\"data-attr-wrapper lb-none-pad lb-none-v-margin lb-box\" data-da-campaign=\"acq_awsblogsb\" data-da-channel=\"ha\" data-da-content=\"database-social\" data-da-language=\"en\" data-da-placement=\"blog-sb-social\" data-da-trk=\"blog_initial\" data-da-type=\"ha\">\n     <ul class=\"lb-txt-none lb-ul lb-list-style-none lb-li-none-v-margin lb-tiny-ul-block\">\n      <li>\n       <a href=\"https://twitter.com/awscloud\">\n        <i class=\"icon-twitter-square\">\n        </i>\n        Twitter\n       </a>\n      </li>\n      <li>\n       <a href=\"https://www.facebook.com/amazonwebservices\">\n        <i class=\"icon-facebook-square\">\n        </i>\n        Facebook\n       </a>\n      </li>\n      <li>\n       <a href=\"https://www.linkedin.com/company/amazon-web-services/\">\n        <i class=\"icon-linkedin-square\">\n        </i>\n        LinkedIn\n       </a>\n      </li>\n      <li>\n       <a href=\"https://www.twitch.tv/aws\">\n        <i class=\"icon-twitch\">\n        </i>\n        Twitch\n       </a>\n      </li>\n      <li>\n       <a href=\"https://pages.awscloud.com/communication-preferences?sc_ichannel=ha&amp;sc_icampaign=acq_awsblogsb&amp;sc_icontent=database-social\">\n        <i class=\"icon-envelope-square\">\n        </i>\n        Email Updates\n       </a>\n      </li>\n     </ul>\n    </div>\n   </div>\n  </div>\n  <div class=\"js-mbox\" data-mbox=\"en_blog_post_sidebar\">\n  </div>\n </div>\n</div>\n",
  "title": "Install additional software components on Amazon RDS Custom for Oracle",
  "author": [
    "Jobin Joseph"
  ]
}

translated = {
  "blogPostOriginalPostId": "10",
  "blogPostLanguageCode": "tr",
  "id": "100",
  "title": "Amazon SageMaker'da Falcon-40B'yi büyük model çıkarımı DLC'leriyle dağıtın",
  "content": [
    "AWS Makine Öğrenimi Blogu",
    "Geçtiğimiz hafta, Teknoloji İnovasyon Enstitüsü (TII) TII Falcon LLM, bir açık kaynak temel büyük dil modeli (LLM) başlattı. Amazon SageMaker ile 1 trilyon jeton üzerinde eğitim alan Falcon, LLAMA-65b gibi diğer LLM'lere göre nispeten hafif ve barındırması daha ucuzken birinci sınıf performansa sahiptir (yazma sırasında Hugging Face liderlik tablosunda #1). Bu yazıda, SageMaker\"da büyük model çıkarım derin öğrenme kapsayıcılarını kullanarak dil anlama ve otomatik yazma yardımı gibi uygulamalar için Falcon\"un nasıl dağıtılacağını gösteriyoruz.",
    "Falcon SageMaker'a indi",
    "TII, Abu Dabi'nin İleri Teknoloji Araştırma Konseyi bünyesindeki uygulamalı araştırma kuruluşudur; bilim adamları, araştırmacılar ve mühendislerden oluşan ekibi, dönüştürücü teknolojilerin keşfine ve toplumumuzu geleceğe hazır olacak bilimsel atılımların geliştirilmesine adamıştır.. Bu yılın başlarında TII, son teknoloji ürünü, açık kaynaklı bir LLM eğitmek için yola çıktı ve işi halletmek için SageMaker'ın altyapısını, takımlarını ve uzmanlığını kullandı (bu modelin SageMaker'da nasıl eğitildiği hakkında daha fazla bilgi edinmek için Teknoloji İnovasyon Enstitüsü'ne bakın, Amazon SageMaker'da son teknoloji Falcon LLM 40B temel modelini eğitiyor). Bu çabanın sonucu TII Falcon LLM'dir.",
    "1 trilyon jeton üzerinde eğitilen Falcon, Eleuther AI Dil Modeli Değerlendirme Kablo Demetine karşı birinci sınıf performansa sahiptir ve şu anda #1 Hugging Face liderlik tablosunda doğruluk için. Model, Falcon-40b ve Falcon-7B olmak üzere iki farklı boyutta mevcuttur ve dil anlama, konuşma deneyimleri ve otomatik yazma yardımı gibi uygulamalarda son teknoloji performans için kullanılabilir. Bu gönderi, bu tür etki alanlarında yüksek doğrulukta çıkarım yapmak için Falcon\"u SageMaker\"da dağıtmaya başlamanıza yardımcı olacaktır..",
    "SageMaker büyük model çıkarım DLC'leri LLM barındırmayı basitleştirir",
    "Falcon-40B ve Falcon-7B gibi LLM'leri barındırmak zor olabilir. Daha büyük modeller milyarlarca parametre içerdikleri için genellikle daha doğrudur, ancak boyutları daha yavaş çıkarım gecikmesine veya daha kötü iş hacmine neden olabilir. Bir LLM barındırmak, kabul edilebilir performans elde etmek için daha fazla GPU belleği ve optimize edilmiş çekirdekler gerektirebilir. İşleri daha da karmaşık hale getirmek için, Falcon-7B gibi daha küçük modeller genellikle AWS G5 bulut sunucusu türlerine güç veren NVIDIA A10G bulut sunucusu gibi tek bir GPU'ya sığabilse de, Falcon-40B gibi daha büyük modeller bunu yapamaz. Bu olduğunda, tensör paralelliği gibi stratejiler, bu daha büyük modeli birden çok parçaya ayırmak ve birden çok GPU'ların belleğinden yararlanmak için kullanılmalıdır. Daha küçük modeller için kullanılan eski barındırma çözümleri genellikle bu tür bir işlevsellik sunmaz, zorluğa katkıda bulunmak.",
    "SageMaker büyük model çıkarımı (LMI) derin öğrenme kapları (DLC'ler) yardımcı olabilir. LMI DLC'ler, Falcon-40B gibi LLM'leri barındırmak için eksiksiz bir uçtan uca çözümdür. Ön uçta, iş hacmini artırmak için bir bulut sunucusu içinde belirteç akışı ve otomatik model replikasyonu gibi özelliklerle büyük model çıkarımı için tasarlanmış yüksek performanslı bir model sunucu (DJL Sunum) içerir. Arka uçta, LMI DLC\"ler ayrıca birkaç yüksek performanslı model paralel motor içerir, DeepSpeed ve FasterTransformer gibi, birden fazla GPU\"da model parametrelerini parçalayabilen ve yönetebilen. Bu motorlar ayrıca, çıkarımı üç kata kadar daha hızlı hızlandırabilen popüler transformatör modelleri için optimize edilmiş çekirdekler içerir. LMI DLC'lerle, SageMaker'da LLM barındırma hizmetini kullanmaya başlamak için bir yapılandırma dosyası oluşturmanız yeterlidir. SageMaker LMI DLC'leri hakkında daha fazla bilgi edinmek için Model paralelliği ve büyük model çıkarımı bölümüne ve mevcut görüntüler listemize bakın. Ayrıca LMI DLC'leri kullanarak SageMaker'da Bloom-175B'yi barındırma hakkındaki önceki yazımıza da göz atabilirsiniz.",
    "Çözüme genel bakış",
    "Bu gönderi, LMI DLC'leri kullanarak SageMaker'da DeepSpeed'i kullanarak Falcon-40B'yi nasıl barındıracağınız konusunda size yol gösterir. Falcon-40B birden fazla A10 GPU kullanmamı gerektirirken, Falcon-7B yalnızca tek bir GPU gerektirir. Ayrıca hem DeepSpeed hem de Accelerate kullanarak ana bilgisayar Falcon-40B ve Falcon-7B'ye başvurabileceğiniz örnekler hazırladık. Kod örneklerimizi GitHub'da bulabilirsiniz.",
    "Bu örnek SageMaker dizüstü bilgisayar bulut sunucularında veya Amazon SageMaker Studio dizüstü bilgisayarlarında çalıştırılabilir. LMI ve DeepSpeed kullanarak Falcon-40B'yi barındırmak için bir ml.g5.24xlarge örneği kullanmamız gerekir. Bu bulut sunucuları, her biri 96 GiB GPU belleğini destekleyen 4x NVIDIA A10G GPU sağlar. Ek olarak, ana bilgisayar 96 vCPU ve 384 GiB ana bilgisayar belleği sağlar. LMI konteyneri, LLM\"leri barındırmakla ilişkili farklılaşmamış ağır kaldırma işlemlerinin çoğunun ele alınmasına yardımcı olacaktır., modelin indirilmesi ve model yapısının bölümlenmesi dahil, böylece oluşan parametreler birden çok GPU\"ya yayılabilir.",
    "SageMaker makine öğrenimi (ML) örnekleri için kotalar hesaplar arasında değişiklik gösterebilir. Bu yayını takip ederken g5.24xlarge örnekleri için kotanızı aştığınızı belirten bir hata alırsanız, Hizmet Kotaları konsolu aracılığıyla sınırı artırabilirsiniz.",
    "Notebook izlenecek yol",
    "Başlamak için, örneğimiz için gerekli bağımlılıkları kurup içe aktararak başlıyoruz. Boto3 SDK'sını ve SageMaker SDK'sını kullanıyoruz. SageMaker ve LMI'nin kullanması için ihtiyaç duyduğumuz model eserlerini depolamak için Amazon Simple Storage Service (Amazon S3) kullandığımızı unutmayın, bu nedenle buna göre bir S3 önek değişkeni ayarlarız. Aşağıdaki koda bakın:",
    "Daha sonra model eserlerimizi saklamak için çalışma alanımız için yerel bir klasör oluşturuyoruz:",
    "Önce oluşturduğumuz yerel dizinde bir.properties yapılandırma dosyası oluşturuyoruz. Bu serving.properties dosyası, kullanmak istediğimiz paralelleştirme ve çıkarım optimizasyon motorunu modelleyen LMI kapsayıcısına ve ön uç DJL Sunumu kitaplığına gösterir. Hem DeepSpeed hem de Hugging Face Accelerate için yapılandırma seçeneklerini Yapılandırmalar ve ayarlarda bulabilirsiniz. Burada, hangi Hugging Face modelinden çekileceğini tanımlamak için option.model_id parametresini ayarladığımızı unutmayın. SageMaker, Hugging Face modelleriyle çalışmayı basitleştirir, ve bu tek satır ihtiyacınız olan tek şey. Buna ek olarak, option.tensor_parallel_degree değerini 4 değerine ayarladık çünkü ml.g5.24xlarge örneğimizde dört GPU'muz var. Bu parametre, modelin kaç bölümünün oluşturulacağını ve dağıtılacağını tanımlar. ml.g5.48xlarge gibi sekiz GPU'lu daha büyük bir örnek kullansaydık ve yine de 4 değeri ayarlasaydık, LMI'nin otomatik olarak modelin iki kopyasını oluşturacağını unutmayın (her biri dört GPU'ya yayılmış iki kopya). Aşağıdaki koda bakın:",
    "İhtiyaçlarınıza daha iyi uyuyorsa tiiuae/falcon-40b-instruct ile tiiuae/falcon-40b-instruct ile tiiuae/falcon-40b de değiştirebilirsiniz.",
    "Ayrıca, ihtiyacınız olan paketleri yüklemek için belirtebileceğiniz bir requirements.txt dosyası da ekleriz:",
    "İhtiyacımız olan son şey, modelinizle birlikte kullanılacak model.py dosyasıdır:",
    "İşte bu! Bu noktada, DeepSpeed ile Falcon-40B'yi dağıtmanız gereken tüm eserleri yarattık! Dizini bir *.tar.gz dosyasına paketliyoruz ve Amazon S3'e yüklüyoruz. Gerçek modelin bu dosyaya indirilmediğini veya paketlenmediğini unutmayın. LMI konteyneri modeli sizin için Hugging Face'den doğrudan indirecektir. Modelin kendi kopyasını indirmek için daha performanslı olacak bir konumda istiyorsanız, bir S3 kovasını hedefleme seçeneğiniz de vardır.. LMI ayrıca Amazon S3'ten yüksek performanslı indirme optimizasyonu içerir. Aşağıdaki koda bakın:",
    "Bu noktada yapılacak tek şey, kullanmak istediğimiz kabı tanımlamak ve bir model nesnesi oluşturmaktır:",
    "Sonra bir uç nokta yapılandırması oluşturur ve uç noktayı oluştururuz:",
    "Başarılı barındırma için akılda tutulması gereken yapılandırma öğeleri",
    "Büyük model barındırma için önemli bir husus, Hugging Face\"den model indirmek için yeterli zaman olmasını sağlamaktır.. Testlerimizde, Falcon-40B'nin örneğe indirilmesi yaklaşık 90 dakika sürdü. Buna izin vermek için önemli bir konfigürasyon kümesi ContainerStartupHealthCheckTimeoutInSeconds ve ModelDataDownloadTimeoutInSeconds. SageMaker uç nokta yapılandırmasının bunların her biri için 3600 değerine sahip olduğundan emin olun. Ek olarak, S5cmD yardımcı programını kullanan LLMS için özel olarak tasarlanmış LMI kaplarını kullanarak orijinal model hayvanat bahçesi yerine Amazon S3'ten indirmek çok daha kolaydır, bu da model indirme süresini yaklaşık 10 dakikaya indirir.",
    "Her şey tamamlandığında size söyleyecek olan DescribeEndPoint'i çağırarak uç noktanın durumunu izleyebilirsiniz. Uç noktanız artık çıkarım isteklerine yanıt vermeye hazır! LMI, model bölümleme ve düzenleme işlemlerini sizin için işlediğinden, her istek ml.g5.12xlarge örneğimizde bulunan 4 GPU'nun tümü kullanılarak işlenecektir. Bu, GPU hızlandırıcılarını yatay olarak ölçeklendiriyorsanız LLM'leri barındırmamıza ve performansı artırmamıza olanak tanır. Aşağıdaki koda bakın:",
    "İşiniz bittiğinde ve uç nokta yapılandırmasını, uç noktasını ve model nesnesini silmek istiyorsanız, aşağıdaki komutları çalıştırabilirsiniz:",
    "Bu yayında referans verdiğimiz bu kod GitHub\"daki tüm not defterinde bulunabilir..",
    "Sonuç",
    "SageMaker Hosting ve LMI DLC, Falcon-40B gibi LLM'leri barındırmanızı kolaylaştırır. Modelleri birden çok GPU'da barındırmak için gerekenleri düzenlemedeki farklılaşmamış ağır kaldırma işlemlerini üstlenir ve ihtiyaçlarınıza uygun yapılandırılabilir seçenekler sunar. Ek olarak, Hugging Face modellerini kullanmak, bu modeller için yerleşik destek ile çok basit hale geliyor.",
    "Bu yazıda, DeepSpeed kullanarak Falcon-40B modelini barındırmak için SageMaker'ı nasıl kullanabileceğinizi gösterdik. Ek olarak, Accelerate kullanarak Falcon-40B\"yi barındırmak için GitHub\"da örnekler verdik, ve daha küçük Falcon-7B modelleri. Bunu LMI ile SageMaker\"da denemenizi ve bugüne kadarki en iyi performans gösteren halka açık LLM ile uygulamalı olmanızı öneririz.!",
    "James Park, Amazon Web Services\"te Çözüm Mimarıdır. AWS'de teknoloji çözümleri tasarlamak, oluşturmak ve dağıtmak için Amazon.com ile birlikte çalışıyor ve yapay zeka ve makine öğrenimine özel ilgi duyuyor. H boş zamanlarında yeni kültürler aramaktan hoşlanıyor, yeni deneyimler, ve en son teknoloji trendleriyle güncel kalmak. Onu LinkedIn\"de bulabilirsiniz.",
    "AWS şirketinde Kıdemli Çözüm Mimarı olan Abhi Shivaditya; Yapay Zeka, dağıtılmış bilgi işlem, ağ oluşturma ve depolama gibi alanlarda AWS hizmetlerinin benimsenmesini kolaylaştırmak için stratejik küresel kurumsal kuruluşlarla birlikte çalışmaktadır. Uzmanlığı Natural Language Processing (NLP) ve Computer Vision alanlarında Derin Öğrenme'de yatmaktadır. Abhi, müşterilerin AWS ekosistemi içinde yüksek performanslı makine öğrenimi modellerini verimli bir şekilde dağıtmalarına yardımcı olur.",
    "Robert Van Dusen, Amazon SageMaker'da Kıdemli Ürün Müdürüdür. Büyük model çıkarımı gibi uygulamalar için derin öğrenme modeli optimizasyonuna öncülük ediyor.",
    "Evandro Franco, Amazon Web Services üzerinde çalışan bir AI/ML Uzmanı Çözüm Mimarıdır. AWS müşterilerinin AWS'nin üstünde AI/ML ile ilgili iş zorluklarının üstesinden gelmelerine yardımcı oluyor. O daha var 15 teknoloji ile çalışan yıllar, yazılım geliştirme, altyapı, sunucusuz, makine öğrenimine.",
    "Qing Lan, AWS'de Yazılım Geliştirme Mühendisidir. Amazon\"da birçok zorlu ürün üzerinde çalışıyor, yüksek performanslı ML çıkarım çözümleri ve yüksek performanslı günlük kaydı sistemi dahil. Qing'in ekibi, Amazon Advertising'de çok düşük gecikme süresi gerektiren ilk Milyar parametreli modeli başarıyla piyasaya sürdü. Qing, altyapı optimizasyonu ve Derin Öğrenme hızlandırma hakkında derinlemesine bilgiye sahiptir.",
    "Frank Liu, AWS Deep Learning için Yazılım Mühendisidir. Yazılım mühendisleri ve bilim adamları için yenilikçi derin öğrenme araçları oluşturmaya odaklanıyor. Boş zamanlarında, arkadaşları ve ailesi ile yürüyüş yapmaktan hoşlanır.",
    "Yorumlar",
    "Yorumları Görüntüle"
  ],
  "authors": [
    "  James Park",
    "  Abhi Shivaditya",
    "  Evandro Franco",
    "  Frank Liu",
    "  Qing Lan",
    "  Robert Van Dusen"
  ]
}


#function to get html from url by calling a lambda
def get_html(url, sourceLanguage, targetLanguage, translationModel, lambda_name):
    try:
        #sends the url to the lambda that will get the html
        response = lambda_connection.invoke(
            FunctionName=lambda_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(
                {
                    "url" :  url,
                    "targetLanguage": {
                        "name": targetLanguage['name'],
                        "code": targetLanguage['code']
                    },
                    "sourceLanguage": {
                        "name": sourceLanguage['name'],
                        "code": sourceLanguage['code']
                    },
                    "translationModel": {
                        "type": translationModel['type']
                    }
                })
        )
        #get the html from the response
        response_json = json.load(response['Payload'])
        print(response_json)
    except Exception as e:
        raise e
    return response_json['file'], response_json['title'], response_json['author']

# {
#     "arguments": {
#         "input": {
#             "url": "https://aws.amazon.com/blogs/machine-learning/deploy-falcon-40b-with-large-model-inference-dlcs-on-amazon-sagemaker/?trk=bade69cc-1806-412a-8d8a-fb17a77100e4&sc_channel=el",
#             "targetLanguage": {
#                 "name": "TURKISH",
#                 "code": "tr"
#             },
#             "sourceLanguage": {
#                 "name": "ENGLISH",
#                 "code": "en"
#             },
#             "translationModel": {
#                 "type": "amazonTranslate"
#             }
#         }
#     }
# }

def get_translated(url, targetLanguage, sourceLanguage, translationModel):
    try:
        #sends the url to the lambda that will get the html
        response = lambda_connection.invoke(
            FunctionName= "UserConfigFunction-staging",
            InvocationType='RequestResponse',
            Payload=json.dumps(
            {
                "arguments": {
                    "input": {
                        "url": url,
                        "targetLanguage": {
                "name": targetLanguage['name'],
                "code": targetLanguage['code']
            },
            "sourceLanguage": {
                "name": sourceLanguage['name'],
                "code": sourceLanguage['code']
            },
            "translationModel": {
                "type": translationModel['type']
            }
        }
    },
}
                )
        )
        #get the html from the response
        response_json = json.load(response['Payload'])
        print(response_json)
    except Exception as e:
        raise e
    return response_json['author'], response_json['title'], response_json['content']
    


def translate_text(html):
    soup = bs.BeautifulSoup(html, 'html.parser')
    for t in soup.find_all(string=True):
        if t.parent.name != "script":
            t.replace_with(translate.translate_text(Text=t, SourceLanguageCode="en", TargetLanguageCode="tr")['TranslatedText'])
    return soup

#Given the translations and lhs_html, reconstruct the rhs_html by replacing the lhs_html text elements with the translated text elements
def replace_text_with_translation(lhs, translated):
    # Create a copy of lhs to avoid modifying the original data
    rhs = deepcopy(lhs)

    # Parse the HTML content
    soup = bs(rhs['file'], 'html.parser')

    # Get the first content element and remove it from translated_content
    translated_content = translated.get('content', [])  # provide a default value to prevent key errors
    first_content = translated_content.pop(0) if translated_content else None

    # Replace the blog title with the translated title, if it exists
    blog_title = soup.find('h1', class_="lb-h2 blog-post-title")
    if blog_title and translated.get('title'):
        blog_title.string = translated['title']

    # Replace the authors
    authors = soup.find_all(property="name")
    translated_authors = translated.get('author', [])  # provide a default value to prevent key errors
    if authors and len(authors) == len(translated_authors):
        for author, new_author in zip(authors, translated_authors):
            author.string = new_author

    # Replace the h2 blog-title with the first content element, if it exists
    h2_blog_title = soup.find('h2', class_="lb-h5 blog-title")
    if h2_blog_title and first_content:
        h2_blog_title.string = first_content

    # Get the content section
    content_section = soup.find(class_="blog-post-content lb-rtxt", property="articleBody")
    if content_section:
        # Get all p and h2 tags from the content section, keeping the order they were found
        content_elements = content_section.find_all(['p', 'h2'])

        # Initialize a counter for translated content
        translated_content_counter = 0

        for element in content_elements:
            # Skip 'p' tags that contain 'img' tags
            if element.name == 'p' and element.find('img'):
                continue
            # Check if we have enough translated content to replace
            if translated_content_counter < len(translated_content):
                # Replace the content
                element.string = translated_content[translated_content_counter]
                # Increment the translated content counter
                translated_content_counter += 1

    # Update the file in rhs
    rhs['file'] = str(soup)

    return rhs