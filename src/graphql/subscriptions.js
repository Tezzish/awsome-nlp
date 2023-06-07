/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTranslationConfig = /* GraphQL */ `
  subscription OnCreateTranslationConfig(
    $filter: ModelSubscriptionTranslationConfigFilterInput
  ) {
    onCreateTranslationConfig(filter: $filter) {
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
export const onUpdateTranslationConfig = /* GraphQL */ `
  subscription OnUpdateTranslationConfig(
    $filter: ModelSubscriptionTranslationConfigFilterInput
  ) {
    onUpdateTranslationConfig(filter: $filter) {
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
export const onDeleteTranslationConfig = /* GraphQL */ `
  subscription OnDeleteTranslationConfig(
    $filter: ModelSubscriptionTranslationConfigFilterInput
  ) {
    onDeleteTranslationConfig(filter: $filter) {
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
export const onCreateBlogPost = /* GraphQL */ `
  subscription OnCreateBlogPost($filter: ModelSubscriptionBlogPostFilterInput) {
    onCreateBlogPost(filter: $filter) {
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
export const onUpdateBlogPost = /* GraphQL */ `
  subscription OnUpdateBlogPost($filter: ModelSubscriptionBlogPostFilterInput) {
    onUpdateBlogPost(filter: $filter) {
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
export const onDeleteBlogPost = /* GraphQL */ `
  subscription OnDeleteBlogPost($filter: ModelSubscriptionBlogPostFilterInput) {
    onDeleteBlogPost(filter: $filter) {
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
export const onCreateRating = /* GraphQL */ `
  subscription OnCreateRating($filter: ModelSubscriptionRatingFilterInput) {
    onCreateRating(filter: $filter) {
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
export const onUpdateRating = /* GraphQL */ `
  subscription OnUpdateRating($filter: ModelSubscriptionRatingFilterInput) {
    onUpdateRating(filter: $filter) {
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
export const onDeleteRating = /* GraphQL */ `
  subscription OnDeleteRating($filter: ModelSubscriptionRatingFilterInput) {
    onDeleteRating(filter: $filter) {
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
export const onCreateLanguage = /* GraphQL */ `
  subscription OnCreateLanguage($filter: ModelSubscriptionLanguageFilterInput) {
    onCreateLanguage(filter: $filter) {
      name
      code
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateLanguage = /* GraphQL */ `
  subscription OnUpdateLanguage($filter: ModelSubscriptionLanguageFilterInput) {
    onUpdateLanguage(filter: $filter) {
      name
      code
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteLanguage = /* GraphQL */ `
  subscription OnDeleteLanguage($filter: ModelSubscriptionLanguageFilterInput) {
    onDeleteLanguage(filter: $filter) {
      name
      code
      createdAt
      updatedAt
    }
  }
`;
export const onCreateTranslationModel = /* GraphQL */ `
  subscription OnCreateTranslationModel(
    $filter: ModelSubscriptionTranslationModelFilterInput
  ) {
    onCreateTranslationModel(filter: $filter) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateTranslationModel = /* GraphQL */ `
  subscription OnUpdateTranslationModel(
    $filter: ModelSubscriptionTranslationModelFilterInput
  ) {
    onUpdateTranslationModel(filter: $filter) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteTranslationModel = /* GraphQL */ `
  subscription OnDeleteTranslationModel(
    $filter: ModelSubscriptionTranslationModelFilterInput
  ) {
    onDeleteTranslationModel(filter: $filter) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
