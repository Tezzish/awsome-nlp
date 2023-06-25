// const AWS = require('aws-sdk');
// const lambda = require('../index.js');

// jest.mock('aws-sdk');

// describe('Lambda Function', () => {
//   let docClientGetSpy;
//   let s3GetObjectMock;

//   beforeEach(() => {
//     docClientGetSpy = jest.spyOn(AWS.DynamoDB.DocumentClient.prototype, 'get').mockImplementation(() => ({
//       promise: jest.fn().mockResolvedValue({}),
//     }));

//     s3GetObjectMock = jest.fn().mockImplementation(() => ({
//       promise: jest.fn().mockResolvedValue({
//         Body: Buffer.from('Mocked S3 response', 'utf-8'),
//       }),
//     }));

//     AWS.S3.prototype.getObject = s3GetObjectMock;
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });

//   it('should return expected response when data is not found in DynamoDB', async () => {
//     const event = {
//       url: 'example.com',
//       targetLanguage: { code: 'en' },
//       translationModel: { type: 'type' },
//     };
//     const expectedResponse = {
//       urlPresent: false,
//       url: 'example.com',
//       targetLanguage: { code: 'en' },
//       sourceLanguage: undefined,
//       translationModel: { type: 'type' },
//     };

//     docClientGetSpy.mockImplementation(() => ({
//       promise: jest.fn().mockResolvedValue({}),
//     }));

//     const response = await lambda.handler(event, {});

//     expect(response).toEqual(expectedResponse);
//     expect(docClientGetSpy).toHaveBeenCalledTimes(1);
//     expect(docClientGetSpy).toHaveBeenCalledWith({
//       TableName: 'translations-aws-blog-posts',
//       Key: { URL: 'example.com[translated]-en-type' },
//     });
//   });

//   it('should return expected response when data is found in DynamoDB', async () => {
//     const event = {
//       url: 'example.com',
//       targetLanguage: { code: 'en' },
//       sourceLanguage: { code: 'fr' },
//       translationModel: { type: 'type' },
//     };
//     const data = {
//       Item: {
//         URL: 'example.com[translated]-en-type',
//         LHS_s3_loc: 'https://s3.amazonaws.com/bucket/lhs-key',
//         RHS_s3_loc: 'https://s3.amazonaws.com/bucket/rhs-key',
//       },
//     };
//     const lhsResponse = {
//       Body: Buffer.from('LHS content', 'utf-8'),
//     };
//     const rhsResponse = {
//       Body: Buffer.from('RHS content', 'utf-8'),
//     };
//     const expectedResponse = {
//       statusCode: 200,
//       urlPresent: true,
//       body: { lhs: 'LHS content', rhs: 'RHS content', id: 'example.com[translated]-en-type' },
//     };

//     docClientGetSpy.mockImplementation(() => ({
//       promise: jest.fn().mockResolvedValue(data),
//     }));
//     s3GetObjectMock.mockImplementation((params) => ({
//       promise: jest.fn().mockResolvedValue({
//         Body: params.Key === 'lhs-key' ? lhsResponse.Body : rhsResponse.Body,
//       }),
//     }));

//     const response = await lambda.handler(event, {});

//     expect(response).toEqual(expectedResponse);
//     expect(docClientGetSpy).toHaveBeenCalledTimes(1);
//     expect(docClientGetSpy).toHaveBeenCalledWith({
//       TableName: 'translations-aws-blog-posts',
//       Key: { URL: 'example.com[translated]-en-type' },
//     });
//     expect(s3GetObjectMock).toHaveBeenCalledTimes(2);
//     expect(s3GetObjectMock).toHaveBeenCalledWith({ Bucket: 'bucket', Key: 'lhs-key' });
//     expect(s3GetObjectMock).toHaveBeenCalledWith({ Bucket: 'bucket', Key: 'rhs-key' });
//   });

//   it('should return error response when S3 getObject throws an error', async () => {
//     const event = {
//       url: 'example.com',
//       targetLanguage: { code: 'en' },
//       sourceLanguage: { code: 'fr' },
//       translationModel: { type: 'type' },
//     };
//     const data = {
//       Item: {
//         URL: 'example.com[translated]-en-type',
//         LHS_s3_loc: 'https://s3.amazonaws.com/bucket/lhs-key',
//         RHS_s3_loc: 'https://s3.amazonaws.com/bucket/rhs-key',
//       },
//     };
//     const expectedError = new Error('S3 getObject error');

//     docClientGetSpy.mockImplementation(() => ({
//       promise: jest.fn().mockResolvedValue(data),
//     }));
//     s3GetObjectMock.mockImplementation(() => ({
//       promise: jest.fn().mockRejectedValue(expectedError),
//     }));

//     const response = await lambda.handler(event, {});

//     expect(response.statusCode).toBe(500);
//     expect(response.body).toEqual(JSON.stringify({ error: expectedError.message }));
//     expect(docClientGetSpy).toHaveBeenCalledTimes(1);
//     expect(docClientGetSpy).toHaveBeenCalledWith({
//       TableName: 'translations-aws-blog-posts',
//       Key: { URL: 'example.com[translated]-en-type' },
//     });
//     expect(s3GetObjectMock).toHaveBeenCalledTimes(1);
//     expect(s3GetObjectMock).toHaveBeenCalledWith({ Bucket: 'bucket', Key: 'lhs-key' });
//   });
// });
