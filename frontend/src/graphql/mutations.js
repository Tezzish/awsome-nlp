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
      language
      translator
      createdAt
      updatedAt
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
      language
      translator
      createdAt
      updatedAt
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
      language
      translator
      createdAt
      updatedAt
    }
  }
`;
