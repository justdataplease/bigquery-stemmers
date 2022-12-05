# Extend BigQuery NLP armory with Stemmers - Implement English,Spanish and Greek Stemmers using JS

## How to reproduce

### 1. Clone the repository

### 2. Run
    npm install
    npm run-script build

### 3. Upload to GCS
    gsutil mb -c nearline -l europe-west3 -p yourproject gs://yourbucket
    gsutil cp dist/nlp.js gs://yourbucket

### 4. Test function
    CREATE TEMP FUNCTION test(a STRING)
    RETURNS STRING
    LANGUAGE js
    OPTIONS (
    library=["gs://yourbucket/nlp.js"]
    )
    AS r"""
    return utils.greekStemmer(a);
    """;

    SELECT test("ΑΥΤΟΚΙΝΗΤΟ")