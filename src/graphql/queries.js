/* eslint-disable */
// this is an auto generated file. This will be overwritten

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

export const translate = /* GraphQL */`
query translate($url: String, $targetLanguage: CreateLanguageInput, $sourceLanguage: CreateLanguageInput, $translationModel: TranslationModelInput) {
  translate(input: {url: $url, targetLanguage: $targetLanguage, sourceLanguage: $sourceLanguage, translationModel: $translationModel}) {
    translationModel {
      name
    }
    originalPost {
      authors
      content
      id
      language {
        name
        code
      }
    }
    content
    authors
    blogPostLanguageCode
    blogPostOriginalPostId
    id
  }
}
`;
