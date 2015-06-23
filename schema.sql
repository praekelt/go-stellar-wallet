CREATE TABLE wallet (
    id SERIAL PRIMARY KEY,
    msisdn VARCHAR UNIQUE,
    address VARCHAR UNIQUE,
    salt VARCHAR,
    privatekey VARCHAR, -- encrypted using pin
    publickey VARCHAR, 
    pinhash VARCHAR, -- SHA1 hash
    created TIMESTAMP DEFAULT NOW(),
    updated TIMESTAMP DEFAULT NOW()
);
