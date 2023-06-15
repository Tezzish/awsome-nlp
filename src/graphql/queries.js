/* eslint-disable */
// this is an auto generated file. This will be overwritten


export const translate = /* GraphQL */ `
  query Translate($input: ConfigInput) {
    translate(input: $input) {
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
  }
`;
export const getBlogPostParsed = /* GraphQL */ `
  query GetBlogPostParsed($url: String) {
    getBlogPostParsed(url: $url) {
      file
    }
  }
`;

export const getStepFunctionInvoker = /* GraphQL */ `
  query GetStepFunctionInvoker($input: ConfigInput) {
    getStepFunctionInvoker(input: $input) {
      lhs
      rhs
    }
  }
`;
export const getTranslationConfig = /* GraphQL */ `
  query GetTranslationConfig($id: ID!) {
    getTranslationConfig(id: $id) {
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
export const listTranslationConfigs = /* GraphQL */ `
  query ListTranslationConfigs(
    $filter: ModelTranslationConfigFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTranslationConfigs(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        url
        createdAt
        updatedAt
        translationConfigTargetLanguageCode
        translationConfigSourceLanguageCode
      }
      nextToken
    }
  }
`;
export const getBlogPost = /* GraphQL */ `
  query GetBlogPost($id: ID!) {
    getBlogPost(id: $id) {
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
  }
`;
export const listBlogPosts = /* GraphQL */ `
  query ListBlogPosts(
    $filter: ModelBlogPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBlogPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getRating = /* GraphQL */ `
  query GetRating($id: ID!) {
    getRating(id: $id) {
      id
      stars
      blogPost {
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
      createdAt
      updatedAt
      ratingBlogPostId
    }
  }
`;
export const listRatings = /* GraphQL */ `
  query ListRatings(
    $filter: ModelRatingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRatings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        stars
        createdAt
        updatedAt
        ratingBlogPostId
      }
      nextToken
    }
  }
`;
export const getLanguage = /* GraphQL */ `
  query GetLanguage($code: String!) {
    getLanguage(code: $code) {
      name
      code
      createdAt
      updatedAt
    }
  }
`;
export const listLanguages = /* GraphQL */ `
  query ListLanguages(
    $code: String
    $filter: ModelLanguageFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listLanguages(
      code: $code
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        name
        code
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
