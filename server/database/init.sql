GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- current state
CREATE TABLE mushineLearning (
    id SERIAL PRIMARY KEY,
    testStrings text
);


INSERT INTO mushineLearning (testStrings) VALUES 
('hello world');

