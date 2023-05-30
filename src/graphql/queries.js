/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getBlogPostParsed = /* GraphQL */ `
  query GetBlogPostParsed {
    getBlogPostParsed(url: "https://aws.amazon.com/blogs/aws/new-amazon-aurora-i-o-optimized-cluster-configuration-with-up-to-40-cost-savings-for-i-o-intensive-applications/?trk=f06df17d-71cb-481d-b7b8-8dd14f9b578c&sc_channel=el%22") {
      file
    }
  }
`;


export const getTranslationJob = /* GraphQL */ `
  query GetTranslationJob($id: ID!) {
    getTranslationJob(id: $id) {
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
export const listTranslationJobs = /* GraphQL */ `
  query ListTranslationJobs(
    $filter: ModelTranslationJobFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTranslationJobs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getLanguage = /* GraphQL */ `
  query GetLanguage($id: ID!) {
    getLanguage(id: $id) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const listLanguages = /* GraphQL */ `
  query ListLanguages(
    $filter: ModelLanguageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLanguages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getTranslationModel = /* GraphQL */ `
  query GetTranslationModel($id: ID!) {
    getTranslationModel(id: $id) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const listTranslationModels = /* GraphQL */ `
  query ListTranslationModels(
    $filter: ModelTranslationModelFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTranslationModels(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
