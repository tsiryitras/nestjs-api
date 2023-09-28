/**
 * Request unit test index
 *
 * Here is the definition of the definition:
 * {
  "mappings": {
    "dynamic": false,
    "fields": {
      "requestId": [
        {
          "type": "token"
        },
        {
          "analyzer": "lucene.keyword",
          "searchAnalyzer": "lucene.keyword",
          "type": "string"
        },
        {
          "type": "autocomplete"
        }
      ],
      "requestType": [
        {
          "type": "token"
        },
        {
          "analyzer": "lucene.keyword",
          "searchAnalyzer": "lucene.keyword",
          "type": "string"
        },
        {
          "type": "autocomplete"
        }
      ]
    }
  }
}
 */
export const REQUEST_UNIT_TEST_INDEX = 'request-unit-test';
/**
 * Collection name for the request unit test with atlas
 */
export const REQUEST_UNIT_TEST_COLLECTION_NAME = 'search-request';
