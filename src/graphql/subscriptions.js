/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTranslationJob = /* GraphQL */ `
  subscription OnCreateTranslationJob(
    $filter: ModelSubscriptionTranslationJobFilterInput
  ) {
    onCreateTranslationJob(filter: $filter) {
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
export const onUpdateTranslationJob = /* GraphQL */ `
  subscription OnUpdateTranslationJob(
    $filter: ModelSubscriptionTranslationJobFilterInput
  ) {
    onUpdateTranslationJob(filter: $filter) {
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
export const onDeleteTranslationJob = /* GraphQL */ `
  subscription OnDeleteTranslationJob(
    $filter: ModelSubscriptionTranslationJobFilterInput
  ) {
    onDeleteTranslationJob(filter: $filter) {
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
export const onCreateLanguage = /* GraphQL */ `
  subscription OnCreateLanguage($filter: ModelSubscriptionLanguageFilterInput) {
    onCreateLanguage(filter: $filter) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateLanguage = /* GraphQL */ `
  subscription OnUpdateLanguage($filter: ModelSubscriptionLanguageFilterInput) {
    onUpdateLanguage(filter: $filter) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteLanguage = /* GraphQL */ `
  subscription OnDeleteLanguage($filter: ModelSubscriptionLanguageFilterInput) {
    onDeleteLanguage(filter: $filter) {
      id
      name
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
