GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- current state
CREATE TABLE mushineLearning (
    id SERIAL PRIMARY KEY,
    testStrings text
);


CREATE TABLE mushine_learning_user (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR (50),
    xp INTEGER
);

