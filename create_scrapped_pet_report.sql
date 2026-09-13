CREATE TABLE scrapped_pet_report (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'found',
    pet_type VARCHAR(20) NOT NULL DEFAULT '',
    pet_name VARCHAR(255) NOT NULL DEFAULT '',
    breed VARCHAR(255) NOT NULL DEFAULT '',
    size VARCHAR(20) NOT NULL DEFAULT 'medium',
    color VARCHAR(255) NOT NULL DEFAULT '',
    markings TEXT NOT NULL DEFAULT '',
    photo_uri TEXT NOT NULL DEFAULT '',
    photo_uris JSONB NOT NULL DEFAULT '[]',
    description TEXT NOT NULL DEFAULT '',
    latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
    location_name VARCHAR(500) NOT NULL DEFAULT '',
    last_seen_date VARCHAR(50) NOT NULL DEFAULT '',
    reward VARCHAR(100) NOT NULL DEFAULT '',
    reward_pool DOUBLE PRECISION NOT NULL DEFAULT 0,
    contact_name VARCHAR(255) NOT NULL DEFAULT '',
    contact_phone VARCHAR(100) NOT NULL DEFAULT '',
    show_contact_public BOOLEAN NOT NULL DEFAULT true,
    reunion_message TEXT,
    reunion_date TIMESTAMP WITH TIME ZONE,
    is_boosted BOOLEAN NOT NULL DEFAULT false,
    boosted_at TIMESTAMP WITH TIME ZONE,
    boost_expires_at TIMESTAMP WITH TIME ZONE,
    pet_reunited_id UUID,
    is_reunited BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    scraped_animal_id VARCHAR(100) NOT NULL DEFAULT '',
    sex VARCHAR(20) NOT NULL DEFAULT 'Unknown',
    details_url TEXT NOT NULL DEFAULT '',
    raw_text TEXT NOT NULL DEFAULT '',
    found_location VARCHAR(500) NOT NULL DEFAULT '',
    detected_breed VARCHAR(255) NOT NULL DEFAULT '',
    detected_color VARCHAR(255) NOT NULL DEFAULT '',
    detected_type VARCHAR(20) NOT NULL DEFAULT '',
    contact_email VARCHAR(255) NOT NULL DEFAULT '',
    scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    microchip_number TEXT,

    CONSTRAINT scrapped_pet_report_detected_type_check CHECK (
        detected_type::text = ANY (
            ARRAY['', 'dog', 'cat', 'other', 'not_detected']::text[]
        )
    ),
    CONSTRAINT scrapped_pet_report_pet_type_check CHECK (
        pet_type::text = ANY (
            ARRAY['', 'dog', 'cat', 'other', 'not_detected']::text[]
        )
    ),
    CONSTRAINT scrapped_pet_report_status_check CHECK (
        status::text = ANY (
            ARRAY['lost', 'found', 'reunite', 'not_detected']::text[]
        )
    ),
    CONSTRAINT scrapped_pet_report_pet_reunited_id_fkey FOREIGN KEY (pet_reunited_id)
        REFERENCES public.reunited_stories (id) ON DELETE SET NULL,
    CONSTRAINT scrapped_pet_report_website_id_fkey FOREIGN KEY (website_id)
        REFERENCES public.websites (id) ON DELETE RESTRICT,
    CONSTRAINT scrapped_pet_report_website_animal_unique UNIQUE (
        website_id, scraped_animal_id, status, last_seen_date
    )
);

CREATE INDEX idx_scrapped_pet_report_created ON scrapped_pet_report USING BTREE (created_at);
CREATE INDEX idx_scrapped_pet_report_deleted_at ON scrapped_pet_report USING BTREE (deleted_at);
CREATE INDEX idx_scrapped_pet_report_details_url ON scrapped_pet_report USING BTREE (details_url);
CREATE INDEX idx_scrapped_pet_report_location ON scrapped_pet_report USING BTREE (latitude, longitude);
CREATE INDEX idx_scrapped_pet_report_scraped_animal_id ON scrapped_pet_report USING BTREE (scraped_animal_id);
CREATE INDEX idx_scrapped_pet_report_scraped_at ON scrapped_pet_report USING BTREE (scraped_at);
CREATE INDEX idx_scrapped_pet_report_status ON scrapped_pet_report USING BTREE (status);
CREATE INDEX idx_scrapped_pet_report_type_status ON scrapped_pet_report USING BTREE (pet_type, status);
CREATE INDEX idx_scrapped_pet_report_type_status_geo ON scrapped_pet_report USING BTREE (pet_type, status, latitude, longitude);
CREATE INDEX idx_scrapped_pet_report_website_id ON scrapped_pet_report USING BTREE (website_id);

CREATE UNIQUE INDEX scrapped_pet_report_pkey ON scrapped_pet_report USING BTREE (id);
CREATE UNIQUE INDEX scrapped_pet_report_website_animal_unique ON scrapped_pet_report USING BTREE (
    website_id, scraped_animal_id, status, last_seen_date
);