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

CREATE TABLE mushine_training_mushrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR (50),
    mushroom_id UUID
);


CREATE TABLE mushine_training_weightings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR (50),
    name VARCHAR (50),
    mushroom_id UUID,
    misidentified_as UUID,
    weight integer,
    timestamp TIMESTAMP
)

'SUM( JOIN mushine_training_mushrooms and mushine_training_weightings ON mushroom_id === misidentifiedAs and userId === userId returning weight)'



