
--
-- PostgreSQL database dump
--

-- Dumped from database version 17.8 (a48d9ca)
-- Dumped by pg_dump version 17.8 (a48d9ca)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_session_jwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_session_jwt WITH SCHEMA public;


--
-- Name: EXTENSION pg_session_jwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_session_jwt IS 'pg_session_jwt: manage authentication sessions using JWTs';


--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neon_auth
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neon_auth;

--
-- Name: pgrst; Type: SCHEMA; Schema: -; Owner: neon_service
--

CREATE SCHEMA pgrst;


ALTER SCHEMA pgrst OWNER TO neon_service;

--
-- Name: pre_config(); Type: FUNCTION; Schema: pgrst; Owner: neon_service
--

CREATE FUNCTION pgrst.pre_config() RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  SELECT
      set_config('pgrst.db_schemas', 'public', true)
    , set_config('pgrst.db_aggregates_enabled', 'true', true)
    , set_config('pgrst.db_anon_role', 'anonymous', true)
    , set_config('pgrst.jwt_role_claim_key', '.role', true)
$$;


ALTER FUNCTION pgrst.pre_config() OWNER TO neon_service;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    \"accountId\" text NOT NULL,
    \"providerId\" text NOT NULL,
    \"userId\" uuid NOT NULL,
    \"accessToken\" text,
    \"refreshToken\" text,
    \"idToken\" text,
    \"accessTokenExpiresAt\" timestamp with time zone,
    \"refreshTokenExpiresAt\" timestamp with time zone,
    scope text,
    password text,
    \"createdAt\" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    \"updatedAt\" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.account OWNER TO neon_auth;

--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    \"organizationId\" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    \"expiresAt\" timestamp with time zone NOT NULL,
    \"createdAt\" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    \"inviterId\" uuid NOT NULL
);


ALTER TABLE neon_auth.invitation OWNER TO neon_auth;

--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    \"publicKey\" text NOT NULL,
    \"privateKey\" text NOT NULL,
    \"createdAt\" timestamp with time zone NOT NULL,
    \"expiresAt\" timestamp with time zone
);


ALTER TABLE neon_auth.jwks OWNER TO neon_auth;

--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    \"organizationId\" uuid NOT NULL,
    \"userId\" uuid NOT NULL,
    role text NOT NULL,
    \"createdAt\" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.member OWNER TO neon_auth;

--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    \"createdAt\" timestamp with time zone NOT NULL,
    metadata text
);


ALTER TABLE neon_auth.organization OWNER TO neon_auth;

--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


ALTER TABLE neon_auth.project_config OWNER TO neon_auth;

--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    \"expiresAt\" timestamp with time zone NOT NULL,
    token text NOT NULL,
    \"createdAt\" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    \"updatedAt\" timestamp with time zone NOT NULL,
    \"ipAddress\" text,
    \"userAgent\" text,
    \"userId\" uuid NOT NULL,
    \"impersonatedBy\" text,
    \"activeOrganizationId\" text
);


ALTER TABLE neon_auth.session OWNER TO neon_auth;

--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.\"user\" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    \"emailVerified\" boolean NOT NULL,
    image text,
    \"createdAt\" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    \"updatedAt\" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    \"banReason\" text,
    \"banExpires\" timestamp with time zone
);


ALTER TABLE neon_auth.\"user\" OWNER TO neon_auth;

--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    \"expiresAt\" timestamp with time zone NOT NULL,
    \"createdAt\" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    \"updatedAt\" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE neon_auth.verification OWNER TO neon_auth;

--
-- Name: ads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    business_name character varying(255) NOT NULL,
    business_type character varying(50) DEFAULT 'other'::character varying,
    contact_name character varying(255),
    contact_email character varying(255),
    contact_phone character varying(100),
    website character varying(500),
    image_uri text NOT NULL,
    link_url text,
    description text,
    placement character varying(20) DEFAULT 'feed'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    duration_days integer DEFAULT 30,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    approved_at timestamp with time zone,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ads OWNER TO neondb_owner;

--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.analytics_events (
    id bigint NOT NULL,
    event_name text NOT NULL,
    user_id text,
    session_id text,
    page_url text,
    referrer text,
    metadata jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now(),
    properties jsonb DEFAULT '{}'::jsonb,
    platform text
);


ALTER TABLE public.analytics_events OWNER TO neondb_owner;

--
-- Name: analytics_events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.analytics_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analytics_events_id_seq OWNER TO neondb_owner;

--
-- Name: analytics_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.analytics_events_id_seq OWNED BY public.analytics_events.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.app_settings (
    key character varying(100) NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.app_settings OWNER TO neondb_owner;

--
-- Name: blocked_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blocked_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    blocker_id uuid NOT NULL,
    blocked_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blocked_users OWNER TO neondb_owner;

--
-- Name: blogs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blogs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    featured_image_url text,
    author_name character varying(255) DEFAULT 'FurFinder Team'::character varying NOT NULL,
    category character varying(100),
    tags jsonb DEFAULT '[]'::jsonb,
    view_count integer DEFAULT 0,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    published_at timestamp with time zone
);


ALTER TABLE public.blogs OWNER TO neondb_owner;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    user_id uuid,
    author character varying(255) NOT NULL,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: content_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.content_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid NOT NULL,
    report_id uuid,
    comment_id uuid,
    reason character varying(100) NOT NULL,
    details text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_reports OWNER TO neondb_owner;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid,
    participant1_id uuid NOT NULL,
    participant2_id uuid NOT NULL,
    last_message_text text DEFAULT ''::text NOT NULL,
    last_message_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversations OWNER TO neondb_owner;

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question character varying(500) NOT NULL,
    answer text NOT NULL,
    category character varying(100),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_published boolean DEFAULT true,
    order_index integer DEFAULT 0
);


ALTER TABLE public.faqs OWNER TO neondb_owner;

--
-- Name: features; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.features (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    icon_name character varying(100),
    icon_url text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_published boolean DEFAULT true,
    order_index integer DEFAULT 0
);


ALTER TABLE public.features OWNER TO neondb_owner;

--
-- Name: how_it_works_steps; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.how_it_works_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    step_number integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    icon_name character varying(100),
    icon_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.how_it_works_steps OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    text text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    message text NOT NULL,
    report_id uuid,
    profile_id uuid,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: organisation_animals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organisation_animals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    pet_type character varying(20) NOT NULL,
    pet_name character varying(255) DEFAULT ''::character varying NOT NULL,
    breed character varying(255) DEFAULT ''::character varying NOT NULL,
    size character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    color character varying(255) DEFAULT ''::character varying NOT NULL,
    markings text DEFAULT ''::text NOT NULL,
    photo_uris jsonb DEFAULT '[]'::jsonb NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    intake_date date,
    intake_type character varying(30) DEFAULT 'stray'::character varying NOT NULL,
    microchip_number character varying(100),
    desexed boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organisation_animals OWNER TO neondb_owner;

--
-- Name: organisations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organisations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(20) NOT NULL,
    abn character varying(50),
    address text NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    website character varying(500),
    latitude double precision DEFAULT 0 NOT NULL,
    longitude double precision DEFAULT 0 NOT NULL,
    description text,
    logo_uri text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organisations OWNER TO neondb_owner;

--
-- Name: pet_profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pet_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    pet_type character varying(20) NOT NULL,
    pet_name character varying(255) NOT NULL,
    breed character varying(255) DEFAULT ''::character varying NOT NULL,
    size character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    color character varying(255) DEFAULT ''::character varying NOT NULL,
    markings text DEFAULT ''::text NOT NULL,
    photo_uris jsonb DEFAULT '[]'::jsonb NOT NULL,
    biometric_photo_uris jsonb DEFAULT '[]'::jsonb NOT NULL,
    microchip_number character varying(100) DEFAULT ''::character varying NOT NULL,
    medical_notes text DEFAULT ''::text NOT NULL,
    suburb character varying(255) DEFAULT ''::character varying NOT NULL,
    owner_name character varying(255) DEFAULT ''::character varying NOT NULL,
    owner_phone character varying(100) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lost_id uuid
);


ALTER TABLE public.pet_profiles OWNER TO neondb_owner;

--
-- Name: pet_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pet_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    status character varying(20) DEFAULT 'lost'::character varying NOT NULL,
    pet_type character varying(20) NOT NULL,
    pet_name character varying(255) NOT NULL,
    breed character varying(255) DEFAULT ''::character varying NOT NULL,
    size character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    color character varying(255) DEFAULT ''::character varying NOT NULL,
    markings text DEFAULT ''::text NOT NULL,
    photo_uri text DEFAULT ''::text NOT NULL,
    photo_uris jsonb DEFAULT '[]'::jsonb NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    latitude double precision DEFAULT 0 NOT NULL,
    longitude double precision DEFAULT 0 NOT NULL,
    location_name character varying(500) DEFAULT ''::character varying NOT NULL,
    last_seen_date character varying(50) DEFAULT ''::character varying NOT NULL,
    reward character varying(100) DEFAULT ''::character varying NOT NULL,
    reward_pool double precision DEFAULT 0 NOT NULL,
    contact_name character varying(255) DEFAULT ''::character varying NOT NULL,
    contact_phone character varying(100) DEFAULT ''::character varying NOT NULL,
    show_contact_public boolean DEFAULT true NOT NULL,
    reunion_message text,
    reunion_date timestamp with time zone,
    is_boosted boolean DEFAULT false NOT NULL,
    boosted_at timestamp with time zone,
    boost_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pet_reunited_id uuid
    is_reunited BOOLEAN DEFAULT false
    pet_id UUID
);


ALTER TABLE public.pet_reports OWNER TO neondb_owner;

--
-- Name: pricing_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pricing_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price_aud numeric(10,2) NOT NULL,
    billing_period character varying(50) DEFAULT 'monthly'::character varying NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    is_popular boolean DEFAULT false,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pricing_plans OWNER TO neondb_owner;

--
-- Name: referral_rewards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.referral_rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(30) NOT NULL,
    days_awarded integer NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.referral_rewards OWNER TO neondb_owner;

--
-- Name: report_likes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.report_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.report_likes OWNER TO neondb_owner;

--
-- Name: reunited_stories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reunited_stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(255) NOT NULL,
    pet_name character varying(255) NOT NULL,
    pet_type character varying(50) NOT NULL,
    owner_name character varying(255) NOT NULL,
    story_title character varying(500) NOT NULL,
    story_content text NOT NULL,
    before_image_url text,
    after_image_url text,
    reunion_date date NOT NULL,
    lost_duration_days integer,
    location_lost character varying(500),
    location_found character varying(500),
    how_they_reunited text,
    featured_on_homepage boolean DEFAULT false,
    view_count integer DEFAULT 0,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_featured boolean DEFAULT false
);


ALTER TABLE public.reunited_stories OWNER TO neondb_owner;

--
-- Name: social_shares; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.social_shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    platform character varying(30) NOT NULL,
    shared_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.social_shares OWNER TO neondb_owner;

--
-- Name: timeline_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timeline_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.timeline_events OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    phone character varying(50),
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    consent_privacy boolean DEFAULT false NOT NULL,
    consent_terms boolean DEFAULT false NOT NULL,
    consent_ai boolean DEFAULT false NOT NULL,
    consent_data_storage boolean DEFAULT false NOT NULL,
    consent_date timestamp with time zone,
    referral_code character varying(10),
    referred_by uuid,
    premium_until timestamp with time zone,
    push_token text,
    reset_otp character varying(10),
    reset_otp_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    premium_source TEXT
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: who_its_for_segments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.who_its_for_segments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    icon_name character varying(100),
    icon_url text,
    use_cases jsonb DEFAULT '[]'::jsonb,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.who_its_for_segments OWNER TO neondb_owner;

--
-- Name: analytics_events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.analytics_events ALTER COLUMN id SET DEFAULT nextval('public.analytics_events_id_seq'::regclass);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.\"user\"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.\"user\"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key);


--
-- Name: blocked_users blocked_users_blocker_id_blocked_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocker_id_blocked_id_key UNIQUE (blocker_id, blocked_id);


--
-- Name: blocked_users blocked_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_slug_key UNIQUE (slug);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: content_reports content_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT content_reports_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_report_id_participant1_id_participant2_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_report_id_participant1_id_participant2_id_key UNIQUE (report_id, participant1_id, participant2_id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);


--
-- Name: how_it_works_steps how_it_works_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.how_it_works_steps
    ADD CONSTRAINT how_it_works_steps_pkey PRIMARY KEY (id);


--
-- Name: how_it_works_steps how_it_works_steps_step_number_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.how_it_works_steps
    ADD CONSTRAINT how_it_works_steps_step_number_key UNIQUE (step_number);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organisation_animals organisation_animals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organisation_animals
    ADD CONSTRAINT organisation_animals_pkey PRIMARY KEY (id);


--
-- Name: organisations organisations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organisations
    ADD CONSTRAINT organisations_pkey PRIMARY KEY (id);


--
-- Name: pet_profiles pet_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pet_profiles
    ADD CONSTRAINT pet_profiles_pkey PRIMARY KEY (id);


--
-- Name: pet_reports pet_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pet_reports
    ADD CONSTRAINT pet_reports_pkey PRIMARY KEY (id);


--
-- Name: pricing_plans pricing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pricing_plans
    ADD CONSTRAINT pricing_plans_pkey PRIMARY KEY (id);


--
-- Name: referral_rewards referral_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_rewards
    ADD CONSTRAINT referral_rewards_pkey PRIMARY KEY (id);


--
-- Name: report_likes report_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.report_likes
    ADD CONSTRAINT report_likes_pkey PRIMARY KEY (id);


--
-- Name: report_likes report_likes_report_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.report_likes
    ADD CONSTRAINT report_likes_report_id_user_id_key UNIQUE (report_id, user_id);


--
-- Name: reunited_stories reunited_stories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reunited_stories
    ADD CONSTRAINT reunited_stories_pkey PRIMARY KEY (id);


--
-- Name: reunited_stories reunited_stories_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reunited_stories
    ADD CONSTRAINT reunited_stories_slug_key UNIQUE (slug);


--
-- Name: social_shares social_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.social_shares
    ADD CONSTRAINT social_shares_pkey PRIMARY KEY (id);


--
-- Name: social_shares social_shares_user_id_platform_shared_date_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.social_shares
    ADD CONSTRAINT social_shares_user_id_platform_shared_date_key UNIQUE (user_id, platform, shared_date);


--
-- Name: timeline_events timeline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);


--
-- Name: who_its_for_segments who_its_for_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.who_its_for_segments
    ADD CONSTRAINT who_its_for_segments_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX \"account_userId_idx\" ON neon_auth.account USING btree (\"userId\");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX \"invitation_organizationId_idx\" ON neon_auth.invitation USING btree (\"organizationId\");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX \"member_organizationId_idx\" ON neon_auth.member USING btree (\"organizationId\");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX \"member_userId_idx\" ON neon_auth.member USING btree (\"userId\");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX \"session_userId_idx\" ON neon_auth.session USING btree (\"userId\");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: idx_ads_placement; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ads_placement ON public.ads USING btree (placement);


--
-- Name: idx_ads_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ads_status ON public.ads USING btree (status);


--
-- Name: idx_ads_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ads_user_id ON public.ads USING btree (user_id);


--
-- Name: idx_analytics_created_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_analytics_created_at ON public.analytics_events USING btree (created_at);


--
-- Name: idx_analytics_event_name; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_analytics_event_name ON public.analytics_events USING btree (event_name);


--
-- Name: idx_blocked_users_blocker; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_blocked_users_blocker ON public.blocked_users USING btree (blocker_id);


--
-- Name: idx_blogs_category; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_blogs_category ON public.blogs USING btree (category);


--
-- Name: idx_blogs_published; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_blogs_published ON public.blogs USING btree (is_published, published_at DESC);


--
-- Name: idx_blogs_slug; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_blogs_slug ON public.blogs USING btree (slug);


--
-- Name: idx_comments_report_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_comments_report_id ON public.comments USING btree (report_id);


--
-- Name: idx_content_reports_reporter; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_content_reports_reporter ON public.content_reports USING btree (reporter_id);


--
-- Name: idx_conversations_participant1; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_conversations_participant1 ON public.conversations USING btree (participant1_id);


--
-- Name: idx_conversations_participant2; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_conversations_participant2 ON public.conversations USING btree (participant2_id);


--
-- Name: idx_faq_order; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_faq_order ON public.faqs USING btree (order_index);


--
-- Name: idx_faqs_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_faqs_active ON public.faqs USING btree (is_active);


--
-- Name: idx_faqs_category; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_faqs_category ON public.faqs USING btree (category);


--
-- Name: idx_features_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_features_active ON public.features USING btree (is_active, display_order);


--
-- Name: idx_features_order; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_features_order ON public.features USING btree (order_index);


--
-- Name: idx_how_it_works; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_how_it_works ON public.how_it_works_steps USING btree (is_active, step_number);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id, created_at);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_org_animals_org_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_org_animals_org_id ON public.organisation_animals USING btree (org_id);


--
-- Name: idx_org_animals_pet_type; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_org_animals_pet_type ON public.organisation_animals USING btree (pet_type);


--
-- Name: idx_org_animals_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_org_animals_status ON public.organisation_animals USING btree (status);


--
-- Name: idx_organisations_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_organisations_status ON public.organisations USING btree (status);


--
-- Name: idx_organisations_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_organisations_user_id ON public.organisations USING btree (user_id);


--
-- Name: idx_pet_profiles_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_profiles_user_id ON public.pet_profiles USING btree (user_id);


--
-- Name: idx_pet_reports_boosted; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_reports_boosted ON public.pet_reports USING btree (is_boosted, boost_expires_at);


--
-- Name: idx_pet_reports_created; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_reports_created ON public.pet_reports USING btree (created_at DESC);


--
-- Name: idx_pet_reports_location; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_reports_location ON public.pet_reports USING btree (latitude, longitude);


--
-- Name: idx_pet_reports_reunited_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_reports_reunited_id ON public.pet_reports USING btree (pet_reunited_id);


--
-- Name: idx_pet_reports_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_reports_status ON public.pet_reports USING btree (status);


--
-- Name: idx_pet_reports_type_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_reports_type_status ON public.pet_reports USING btree (pet_type, status);


--
-- Name: idx_pet_reports_type_status_geo; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_reports_type_status_geo ON public.pet_reports USING btree (pet_type, status, latitude, longitude);


--
-- Name: idx_pet_reports_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pet_reports_user_id ON public.pet_reports USING btree (user_id);


--
-- Name: idx_pricing_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pricing_active ON public.pricing_plans USING btree (is_active, display_order);


--
-- Name: idx_referral_rewards_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_referral_rewards_user ON public.referral_rewards USING btree (user_id);


--
-- Name: idx_report_likes_report_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_report_likes_report_id ON public.report_likes USING btree (report_id);


--
-- Name: idx_reunited_published; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_reunited_published ON public.reunited_stories USING btree (is_published, featured_on_homepage);


--
-- Name: idx_reunited_slug; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_reunited_slug ON public.reunited_stories USING btree (slug);


--
-- Name: idx_social_shares_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_social_shares_user ON public.social_shares USING btree (user_id);


--
-- Name: idx_timeline_report_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_timeline_report_id ON public.timeline_events USING btree (report_id);


--
-- Name: idx_users_referral_code; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_referral_code ON public.users USING btree (referral_code);


--
-- Name: idx_who_its_for; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_who_its_for ON public.who_its_for_segments USING btree (is_active, display_order);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT \"account_userId_fkey\" FOREIGN KEY (\"userId\") REFERENCES neon_auth.\"user\"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT \"invitation_inviterId_fkey\" FOREIGN KEY (\"inviterId\") REFERENCES neon_auth.\"user\"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT \"invitation_organizationId_fkey\" FOREIGN KEY (\"organizationId\") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT \"member_organizationId_fkey\" FOREIGN KEY (\"organizationId\") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT \"member_userId_fkey\" FOREIGN KEY (\"userId\") REFERENCES neon_auth.\"user\"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT \"session_userId_fkey\" FOREIGN KEY (\"userId\") REFERENCES neon_auth.\"user\"(id) ON DELETE CASCADE;


--
-- Name: ads ads_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ads ads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blocked_users blocked_users_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: blocked_users blocked_users_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blocked_users
    ADD CONSTRAINT blocked_users_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.pet_reports(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: content_reports content_reports_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT content_reports_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: content_reports content_reports_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT content_reports_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.pet_reports(id) ON DELETE CASCADE;


--
-- Name: content_reports content_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT content_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_participant1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_participant2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.pet_reports(id) ON DELETE SET NULL;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.pet_profiles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.pet_reports(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: organisation_animals organisation_animals_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organisation_animals
    ADD CONSTRAINT organisation_animals_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organisations(id) ON DELETE CASCADE;


--
-- Name: organisations organisations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organisations
    ADD CONSTRAINT organisations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pet_profiles pet_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pet_profiles
    ADD CONSTRAINT pet_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pet_reports pet_reports_reunited_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pet_reports
    ADD CONSTRAINT pet_reports_reunited_id_fkey FOREIGN KEY (pet_reunited_id) REFERENCES public.reunited_stories(id) ON DELETE SET NULL;


--
-- Name: pet_reports pet_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pet_reports
    ADD CONSTRAINT pet_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: referral_rewards referral_rewards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_rewards
    ADD CONSTRAINT referral_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: report_likes report_likes_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.report_likes
    ADD CONSTRAINT report_likes_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.pet_reports(id) ON DELETE CASCADE;


--
-- Name: report_likes report_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.report_likes
    ADD CONSTRAINT report_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: social_shares social_shares_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.social_shares
    ADD CONSTRAINT social_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: timeline_events timeline_events_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.pet_reports(id) ON DELETE CASCADE;


--
-- Name: users users_referred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO authenticated;


--
-- Name: SCHEMA pgrst; Type: ACL; Schema: -; Owner: neon_service
--

GRANT USAGE ON SCHEMA pgrst TO authenticator;


--
-- Name: FUNCTION pre_config(); Type: ACL; Schema: pgrst; Owner: neon_service
--

GRANT ALL ON FUNCTION pgrst.pre_config() TO authenticator;


--
-- Name: TABLE ads; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.ads TO authenticated;


--
-- Name: TABLE analytics_events; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.analytics_events TO authenticated;


--
-- Name: SEQUENCE analytics_events_id_seq; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT USAGE ON SEQUENCE public.analytics_events_id_seq TO authenticated;


--
-- Name: TABLE app_settings; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.app_settings TO authenticated;


--
-- Name: TABLE blocked_users; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.blocked_users TO authenticated;


--
-- Name: TABLE blogs; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.blogs TO authenticated;


--
-- Name: TABLE comments; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.comments TO authenticated;


--
-- Name: TABLE content_reports; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.content_reports TO authenticated;


--
-- Name: TABLE conversations; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.conversations TO authenticated;


--
-- Name: TABLE faqs; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.faqs TO authenticated;


--
-- Name: TABLE features; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.features TO authenticated;


--
-- Name: TABLE how_it_works_steps; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.how_it_works_steps TO authenticated;


--
-- Name: TABLE messages; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.messages TO authenticated;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.notifications TO authenticated;


--
-- Name: TABLE organisation_animals; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.organisation_animals TO authenticated;


--
-- Name: TABLE organisations; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.organisations TO authenticated;


--
-- Name: TABLE pet_profiles; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pet_profiles TO authenticated;


--
-- Name: TABLE pet_reports; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pet_reports TO authenticated;


--
-- Name: TABLE pricing_plans; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pricing_plans TO authenticated;


--
-- Name: TABLE referral_rewards; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.referral_rewards TO authenticated;


--
-- Name: TABLE report_likes; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.report_likes TO authenticated;


--
-- Name: TABLE reunited_stories; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.reunited_stories TO authenticated;


--
-- Name: TABLE social_shares; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.social_shares TO authenticated;


--
-- Name: TABLE timeline_events; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.timeline_events TO authenticated;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.users TO authenticated;


--
-- Name: TABLE who_its_for_segments; Type: ACL; Schema: public; Owner: neondb_owner
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.who_its_for_segments TO authenticated;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: neondb_owner
--

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: neondb_owner
--

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: neondb_owner
--

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO authenticated;


--
-- PostgreSQL database dump complete
--


--
-- Name: claim_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.claim_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    lost_report_id uuid NOT NULL REFERENCES public.pet_reports(id),
    found_report_id uuid NOT NULL REFERENCES public.pet_reports(id),
    claimer_user_id uuid NOT NULL REFERENCES public.users(id),
    found_user_id uuid NOT NULL REFERENCES public.users(id),
    status character varying(20) DEFAULT 'pending' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.claim_requests OWNER TO neondb_owner;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'premium_monthly',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | expired | cancelled | revoked
    source VARCHAR(20) NOT NULL, -- apple | google | stripe | manual
    store_product_id TEXT, -- legacy
    product_id TEXT,
    original_transaction_id TEXT,
    latest_transaction_id TEXT,
    current_period_start TIMESTAMPTZ DEFAULT now(),
    current_period_end TIMESTAMPTZ,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- legacy compatibility
    expires_at TIMESTAMPTZ, -- legacy compatibility
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions OWNER TO neondb_owner;

--
-- Name: purchase_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchase_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    platform VARCHAR(20) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    transaction_id TEXT,
    original_transaction_id TEXT,
    product_id TEXT,
    expires_at TIMESTAMPTZ,
    store_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.purchase_events OWNER TO neondb_owner;

--
-- Name: webhook_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.webhook_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source VARCHAR(20) NOT NULL,
    event_id TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    processed BOOLEAN NOT NULL DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.webhook_events OWNER TO neondb_owner;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product_id ON public.subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_purchase_events_user_id ON public.purchase_events(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_events_created_at ON public.purchase_events(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_events_transaction_id
    ON public.purchase_events(transaction_id)
    WHERE transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_source_event_id
    ON public.webhook_events(source, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed
    ON public.webhook_events(processed, created_at DESC);

--
-- Update pricing_plans
--

ALTER TABLE public.pricing_plans
  ADD COLUMN IF NOT EXISTS apple_product_id TEXT,
  ADD COLUMN IF NOT EXISTS google_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
