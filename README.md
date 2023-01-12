# Extend BigQuery NLP armory with Stemmers - Implement English,Spanish and Greek Stemmers using JS

Read original article [here](https://medium.com/mlearning-ai/extend-bigquery-nlp-armory-with-stemmers-995fae853b0e).

## How to reproduce

*If you want to just test or use stemming functionality in BigQuery, without implementing it,
go to — 7. Stemmers Demo.

### 1. Clone the repository

    git clone https://github.com/justdataplease/bigquery-stemmers.git

### 2. Install necessary packages defined in package.json.

    npm install

### 3. Run webpack.config.js to create our package using webpack.

    npm run-script build

### 4. Create a bucket in GCS. Make sure to change "yourproject" with your GCP project id and "yourbucket" with your desired bucket name (has to be universally unique).

    gsutil mb -c nearline -l europe-west3 -p yourproject gs://yourbucket

### 5. Copy webpack output or stemmers.js to GCS.

    gsutil cp dist/stemmers.js gs://yourbucket

### 6. Implement stemmers

As an example, we will translate the following English sentence into Greek and Spanish.

"Natural language processing is a subfield of linguistics computer science and artificial intelligence concerned with
the interactions between computers and human language"

    -- Define corpus
    DECLARE grString,enString,esString STRING;
    SET grString = "Η επεξεργασία φυσικής γλώσσας είναι ένα υποπεδίο της γλωσσολογίας της επιστήμης των υπολογιστών και της τεχνητής νοημοσύνης που ασχολείται με τις αλληλεπιδράσεις μεταξύ των υπολογιστών και της ανθρώπινης γλώσσας";
    SET enString = "Natural language processing is a subfield of linguistics computer science and artificial intelligence concerned with the interactions between computers and human language";
    SET esString = "El procesamiento del lenguaje natural es un subcampo de la lingüística la informática y la inteligencia artificial que se ocupa de las interacciones entre las computadoras y el lenguaje humano";
    
    -- Create greek stemmer
    CREATE TEMP FUNCTION grStemmer(word STRING)
    RETURNS STRING
    LANGUAGE js
    OPTIONS (
    library=["gs://yourbucket/stemmers.js"]
    )
    AS r"""
    return utils.greekStemmer(word);
    """;
    
    -- Create english stemmer
    CREATE TEMP FUNCTION porterStemmer(word STRING)
    RETURNS STRING
    LANGUAGE js
    OPTIONS (
    library=["gs://yourbucket/stemmers.js"]
    )
    AS r"""
    return utils.porterStemmer(word);
    """;
    
    -- Create Spanish stemmer
    CREATE TEMP FUNCTION esStemmer(word STRING)
    RETURNS STRING
    LANGUAGE js
    OPTIONS (
    library=["gs://yourbucket/stemmers.js"]
    )
    AS r"""
    return utils.unineStemmer(word);
    """;
    
    -- Remove accents and convers to upper case - greek stemmer requirement
    CREATE TEMP FUNCTION fix_word(word STRING) AS ((
    SELECT UPPER(regexp_replace(normalize(word, NFD), r"\pM", ''))
    ));
    
    -- Union all sentenses
    WITH corpus AS (
      SELECT word, 'gr' lang FROM UNNEST(SPLIT(grString," ")) word 
      UNION ALL
      SELECT word, 'en' lang FROM UNNEST(SPLIT(enString," ")) word 
      UNION ALL
      SELECT word,'es' lang FROM UNNEST(SPLIT(esString," ")) word 
    )
    
    -- Run stemmers
    SELECT 
    lang,
    string_agg(
    CASE lang 
    WHEN 'gr' THEN grStemmer(fix_word(word))
    WHEN 'en' THEN porterStemmer(word)
    WHEN 'es' THEN esStemmer(word) 
    ELSE 'missing' END," ") stemmed, 
    string_agg(word," ") original
    FROM corpus
    GROUP BY 1

Output

    1 
    lang : gr
    stemmed : Η ΕΠΕΞΕΡΓΑΣ ΦΥΣΙΚ ΓΛΩΣΣ ΕΙΝΑΙ ΕΝ ΥΠΟΠΕΔ ΤΗΣ ΓΛΩΣΣΟΛΟΓ ΤΗΣ ΕΠΙΣΤΗΜ ΤΩΝ ΥΠΟΛΟΓΙΣΤ ΚΑΙ ΤΗΣ ΤΕΧΝΗΤ ΝΟΗΜΟΣΥΝ ΠΟΥ ΑΣΧΟΛΕΙΤΑ ΜΕ ΤΙΣ ΑΛΛΗΛΕΠΙΔΡΑΣ ΜΕΤΑΞΥ ΤΩΝ ΥΠΟΛΟΓΙΣΤ ΚΑΙ ΤΗΣ ΑΝΘΡΩΠΙΝ ΓΛΩΣΣ
    orginal : Η επεξεργασία φυσικής γλώσσας είναι ένα υποπεδίο της γλωσσολογίας της επιστήμης των υπολογιστών και της τεχνητής νοημοσύνης που ασχολείται με τις αλληλεπιδράσεις μεταξύ των υπολογιστών και της ανθρώπινης γλώσσας
    
    2 
    lang : en
    stemmed : natur languag process is a subfield of linguist comput scienc and artifici intellig concern with the interact between comput and human languag
    orginal : Natural language processing is a subfield of linguistics computer science and artificial intelligence concerned with the interactions between computers and human language
    
    3 
    lang : es
    stemmed : El procesamient del lenguaj natural es un subcamp de la linguistic la informatic y la inteligenci artificial que se ocup de las interaccion entr las computador y el lenguaj human
    orginal : El procesamiento del lenguaje natural es un subcampo de la lingüística la informática y la inteligencia artificial que se ocupa de las 

### 7. Stemmers Demo

    -- Define corpus
    DECLARE grString,enString,esString STRING;
    SET grString = "Η επεξεργασία φυσικής γλώσσας είναι ένα υποπεδίο της γλωσσολογίας της επιστήμης των υπολογιστών και της τεχνητής νοημοσύνης που ασχολείται με τις αλληλεπιδράσεις μεταξύ των υπολογιστών και της ανθρώπινης γλώσσας";
    SET enString = "Natural language processing is a subfield of linguistics computer science and artificial intelligence concerned with the interactions between computers and human language";
    SET esString = "El procesamiento del lenguaje natural es un subcampo de la lingüística la informática y la inteligencia artificial que se ocupa de las interacciones entre las computadoras y el lenguaje humano";
    
    
    -- Remove accents and convers to upper case - greek stemmer requirement
    CREATE TEMP FUNCTION fix_word(word STRING) AS ((
    SELECT UPPER(regexp_replace(normalize(word, NFD), r"\pM", ''))
    ));
    
    -- Union all sentenses
    WITH corpus AS (
      SELECT word, 'gr' lang FROM UNNEST(SPLIT(grString," ")) word 
      UNION ALL
      SELECT word, 'en' lang FROM UNNEST(SPLIT(enString," ")) word 
      UNION ALL
      SELECT word,'es' lang FROM UNNEST(SPLIT(esString," ")) word 
    )
    
    -- Run stemmers
    SELECT 
    lang,
    string_agg(
    CASE lang 
    WHEN 'gr' THEN justfunctions.eu.grStemmer(fix_word(word))
    WHEN 'en' THEN justfunctions.eu.porterStemmer(word)
    WHEN 'es' THEN justfunctions.eu.esStemmer(word) 
    ELSE 'missing' END," ") stemmed, 
    string_agg(word," ") original
    FROM corpus
    GROUP BY 1

Output

    1 
    lang : gr
    stemmed : Η ΕΠΕΞΕΡΓΑΣ ΦΥΣΙΚ ΓΛΩΣΣ ΕΙΝΑΙ ΕΝ ΥΠΟΠΕΔ ΤΗΣ ΓΛΩΣΣΟΛΟΓ ΤΗΣ ΕΠΙΣΤΗΜ ΤΩΝ ΥΠΟΛΟΓΙΣΤ ΚΑΙ ΤΗΣ ΤΕΧΝΗΤ ΝΟΗΜΟΣΥΝ ΠΟΥ ΑΣΧΟΛΕΙΤΑ ΜΕ ΤΙΣ ΑΛΛΗΛΕΠΙΔΡΑΣ ΜΕΤΑΞΥ ΤΩΝ ΥΠΟΛΟΓΙΣΤ ΚΑΙ ΤΗΣ ΑΝΘΡΩΠΙΝ ΓΛΩΣΣ
    orginal : Η επεξεργασία φυσικής γλώσσας είναι ένα υποπεδίο της γλωσσολογίας της επιστήμης των υπολογιστών και της τεχνητής νοημοσύνης που ασχολείται με τις αλληλεπιδράσεις μεταξύ των υπολογιστών και της ανθρώπινης γλώσσας
    
    2 
    lang : en
    stemmed : natur languag process is a subfield of linguist comput scienc and artifici intellig concern with the interact between comput and human languag
    orginal : Natural language processing is a subfield of linguistics computer science and artificial intelligence concerned with the interactions between computers and human language
    
    3 
    lang : es
    stemmed : El procesamient del lenguaj natural es un subcamp de la linguistic la informatic y la inteligenci artificial que se ocup de las interaccion entr las computador y el lenguaj human
    orginal : El procesamiento del lenguaje natural es un subcampo de la lingüística la informática y la inteligencia artificial que se ocupa de las 
   

