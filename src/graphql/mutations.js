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
