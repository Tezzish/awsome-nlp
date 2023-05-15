/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTranslationConfig = /* GraphQL */ `
  query GetTranslationConfig($id: ID!) {
    getTranslationConfig(id: $id) {
      id
      url
      language
      translator
      createdAt
      updatedAt
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
        language
        translator
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
