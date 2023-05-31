/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTranslationJob = /* GraphQL */ `
  mutation CreateTranslationJob(
    $input: CreateTranslationJobInput!
    $condition: ModelTranslationJobConditionInput
  ) {
    createTranslationJob(input: $input, condition: $condition) {
      id
      url
      language
      translationModel
      status
      originalContent
      translatedContent
      createdAt
      updatedAt
    }
  }
`;
export const updateTranslationJob = /* GraphQL */ `
  mutation UpdateTranslationJob(
    $input: UpdateTranslationJobInput!
    $condition: ModelTranslationJobConditionInput
  ) {
    updateTranslationJob(input: $input, condition: $condition) {
      id
      url
      language
      translationModel
      status
      originalContent
      translatedContent
      createdAt
      updatedAt
    }
  }
`;
export const deleteTranslationJob = /* GraphQL */ `
  mutation DeleteTranslationJob(
    $input: DeleteTranslationJobInput!
    $condition: ModelTranslationJobConditionInput
  ) {
    deleteTranslationJob(input: $input, condition: $condition) {
      id
      url
      language
      translationModel
      status
      originalContent
      translatedContent
      createdAt
      updatedAt
    }
  }
`;
export const createLanguage = /* GraphQL */ `
  mutation CreateLanguage(
    $input: CreateLanguageInput!
    $condition: ModelLanguageConditionInput
  ) {
    createLanguage(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const updateLanguage = /* GraphQL */ `
  mutation UpdateLanguage(
    $input: UpdateLanguageInput!
    $condition: ModelLanguageConditionInput
  ) {
    updateLanguage(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const deleteLanguage = /* GraphQL */ `
  mutation DeleteLanguage(
    $input: DeleteLanguageInput!
    $condition: ModelLanguageConditionInput
  ) {
    deleteLanguage(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const createTranslationModel = /* GraphQL */ `
  mutation CreateTranslationModel(
    $input: CreateTranslationModelInput!
    $condition: ModelTranslationModelConditionInput
  ) {
    createTranslationModel(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const updateTranslationModel = /* GraphQL */ `
  mutation UpdateTranslationModel(
    $input: UpdateTranslationModelInput!
    $condition: ModelTranslationModelConditionInput
  ) {
    updateTranslationModel(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const deleteTranslationModel = /* GraphQL */ `
  mutation DeleteTranslationModel(
    $input: DeleteTranslationModelInput!
    $condition: ModelTranslationModelConditionInput
  ) {
    deleteTranslationModel(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTranslationConfig = /* GraphQL */ `
  mutation CreateTranslationConfig(
    $input: CreateTranslationConfigInput!
    $condition: ModelTranslationConfigConditionInput
  ) {
    createTranslationConfig(input: $input, condition: $condition) {
      id
      url
      targetLanguage {
        name
        code
        createdAt
        updatedAt
      }
      sourceLanguage {
        name
        code
        createdAt
        updatedAt
      }
      translationModel {
        id
        name
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      translationConfigTargetLanguageCode
      translationConfigSourceLanguageCode
    }
  }
`;
export const updateTranslationConfig = /* GraphQL */ `
  mutation UpdateTranslationConfig(
    $input: UpdateTranslationConfigInput!
    $condition: ModelTranslationConfigConditionInput
  ) {
    updateTranslationConfig(input: $input, condition: $condition) {
      id
      url
      targetLanguage {
        name
        code
        createdAt
        updatedAt
      }
      sourceLanguage {
        name
        code
        createdAt
        updatedAt
      }
      translationModel {
        id
        name
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      translationConfigTargetLanguageCode
      translationConfigSourceLanguageCode
    }
  }
`;
export const deleteTranslationConfig = /* GraphQL */ `
  mutation DeleteTranslationConfig(
    $input: DeleteTranslationConfigInput!
    $condition: ModelTranslationConfigConditionInput
  ) {
    deleteTranslationConfig(input: $input, condition: $condition) {
      id
      url
      targetLanguage {
        name
        code
        createdAt
        updatedAt
      }
      sourceLanguage {
        name
        code
        createdAt
        updatedAt
      }
      translationModel {
        id
        name
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      translationConfigTargetLanguageCode
      translationConfigSourceLanguageCode
    }
  }
`;
export const createBlogPost = /* GraphQL */ `
  mutation CreateBlogPost(
    $input: CreateBlogPostInput!
    $condition: ModelBlogPostConditionInput
  ) {
    createBlogPost(input: $input, condition: $condition) {
      id
      originalPost {
        id
        originalPost {
          id
          title
          authors
          content
          createdAt
          updatedAt
          blogPostOriginalPostId
          blogPostLanguageCode
          blogPostTranslationModelId
        }
        language {
          name
          code
          createdAt
          updatedAt
        }
        title
        authors
        content
        translationModel {
          id
          name
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        blogPostOriginalPostId
        blogPostLanguageCode
        blogPostTranslationModelId
      }
      language {
        name
        code
        createdAt
        updatedAt
      }
      title
      authors
      content
      translationModel {
        id
        name
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      blogPostOriginalPostId
      blogPostLanguageCode
      blogPostTranslationModelId
    }
  }
`;
export const updateBlogPost = /* GraphQL */ `
  mutation UpdateBlogPost(
    $input: UpdateBlogPostInput!
    $condition: ModelBlogPostConditionInput
  ) {
    updateBlogPost(input: $input, condition: $condition) {
      id
      originalPost {
        id
        originalPost {
          id
          title
          authors
          content
          createdAt
          updatedAt
          blogPostOriginalPostId
          blogPostLanguageCode
          blogPostTranslationModelId
        }
        language {
          name
          code
          createdAt
          updatedAt
        }
        title
        authors
        content
        translationModel {
          id
          name
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        blogPostOriginalPostId
        blogPostLanguageCode
        blogPostTranslationModelId
      }
      language {
        name
        code
        createdAt
        updatedAt
      }
      title
      authors
      content
      translationModel {
        id
        name
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      blogPostOriginalPostId
      blogPostLanguageCode
      blogPostTranslationModelId
    }
  }
`;
export const deleteBlogPost = /* GraphQL */ `
  mutation DeleteBlogPost(
    $input: DeleteBlogPostInput!
    $condition: ModelBlogPostConditionInput
  ) {
    deleteBlogPost(input: $input, condition: $condition) {
      id
      originalPost {
        id
        originalPost {
          id
          title
          authors
          content
          createdAt
          updatedAt
          blogPostOriginalPostId
          blogPostLanguageCode
          blogPostTranslationModelId
        }
        language {
          name
          code
          createdAt
          updatedAt
        }
        title
        authors
        content
        translationModel {
          id
          name
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        blogPostOriginalPostId
        blogPostLanguageCode
        blogPostTranslationModelId
      }
      language {
        name
        code
        createdAt
        updatedAt
      }
      title
      authors
      content
      translationModel {
        id
        name
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      blogPostOriginalPostId
      blogPostLanguageCode
      blogPostTranslationModelId
    }
  }
`;
export const createLanguage = /* GraphQL */ `
  mutation CreateLanguage(
    $input: CreateLanguageInput!
    $condition: ModelLanguageConditionInput
  ) {
    createLanguage(input: $input, condition: $condition) {
      name
      code
      createdAt
      updatedAt
    }
  }
`;
export const updateLanguage = /* GraphQL */ `
  mutation UpdateLanguage(
    $input: UpdateLanguageInput!
    $condition: ModelLanguageConditionInput
  ) {
    updateLanguage(input: $input, condition: $condition) {
      name
      code
      createdAt
      updatedAt
    }
  }
`;
export const deleteLanguage = /* GraphQL */ `
  mutation DeleteLanguage(
    $input: DeleteLanguageInput!
    $condition: ModelLanguageConditionInput
  ) {
    deleteLanguage(input: $input, condition: $condition) {
      name
      code
      createdAt
      updatedAt
    }
  }
`;
export const createTranslationModel = /* GraphQL */ `
  mutation CreateTranslationModel(
    $input: CreateTranslationModelInput!
    $condition: ModelTranslationModelConditionInput
  ) {
    createTranslationModel(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const updateTranslationModel = /* GraphQL */ `
  mutation UpdateTranslationModel(
    $input: UpdateTranslationModelInput!
    $condition: ModelTranslationModelConditionInput
  ) {
    updateTranslationModel(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const deleteTranslationModel = /* GraphQL */ `
  mutation DeleteTranslationModel(
    $input: DeleteTranslationModelInput!
    $condition: ModelTranslationModelConditionInput
  ) {
    deleteTranslationModel(input: $input, condition: $condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
