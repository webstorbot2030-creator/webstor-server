--
-- PostgreSQL database dump
--

\restrict HkTUxdx3HMBNvWZTHVLjVFcJCmF5jVO1qIs9cO2OiGCxIHZy7yF0L1jjwd5ylp2

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounting_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounting_periods (
    id integer NOT NULL,
    year integer NOT NULL,
    month integer,
    period_type text DEFAULT 'monthly'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    closed_at timestamp without time zone,
    closed_by integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: accounting_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounting_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounting_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounting_periods_id_seq OWNED BY public.accounting_periods.id;


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    code text NOT NULL,
    name_ar text NOT NULL,
    type text NOT NULL,
    parent_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: admin_activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_activity_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    details text,
    target_type text,
    target_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: admin_activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_activity_logs_id_seq OWNED BY public.admin_activity_logs.id;


--
-- Name: ads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ads (
    id integer NOT NULL,
    text text NOT NULL,
    icon text NOT NULL,
    active boolean DEFAULT true,
    image_url text,
    link_url text,
    ad_type text DEFAULT 'text'::text
);


--
-- Name: ads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ads_id_seq OWNED BY public.ads.id;


--
-- Name: api_order_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_order_logs (
    id integer NOT NULL,
    order_id integer,
    provider_id integer NOT NULL,
    direction text DEFAULT 'outgoing'::text NOT NULL,
    request_data text,
    response_data text,
    external_order_id text,
    external_reference text,
    status text DEFAULT 'pending'::text,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: api_order_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_order_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_order_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_order_logs_id_seq OWNED BY public.api_order_logs.id;


--
-- Name: api_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_providers (
    id integer NOT NULL,
    name text NOT NULL,
    provider_type text DEFAULT 'megacenter'::text NOT NULL,
    base_url text NOT NULL,
    username text,
    password text,
    api_token text,
    is_active boolean DEFAULT true,
    webhook_url text,
    ip_whitelist text,
    balance numeric(15,2) DEFAULT 0,
    currency text DEFAULT 'USD'::text,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: api_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_providers_id_seq OWNED BY public.api_providers.id;


--
-- Name: api_service_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_service_mappings (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    local_service_id integer NOT NULL,
    external_service_id text NOT NULL,
    external_service_name text,
    external_price numeric(15,2),
    is_active boolean DEFAULT true,
    auto_forward boolean DEFAULT false,
    required_fields text
);


--
-- Name: api_service_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_service_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_service_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_service_mappings_id_seq OWNED BY public.api_service_mappings.id;


--
-- Name: api_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    ip_whitelist text,
    last_used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: api_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_tokens_id_seq OWNED BY public.api_tokens.id;


--
-- Name: banks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    bank_name text NOT NULL,
    account_name text NOT NULL,
    account_number text NOT NULL,
    note text
);


--
-- Name: banks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banks_id_seq OWNED BY public.banks.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    icon text,
    image text
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: deposit_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deposit_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount integer NOT NULL,
    receipt_url text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    fund_id integer,
    approved_by integer,
    approved_amount integer,
    rejection_reason text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: deposit_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deposit_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deposit_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deposit_requests_id_seq OWNED BY public.deposit_requests.id;


--
-- Name: fund_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fund_transactions (
    id integer NOT NULL,
    fund_id integer NOT NULL,
    transaction_type text NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text,
    related_entry_id integer,
    related_order_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fund_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fund_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fund_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fund_transactions_id_seq OWNED BY public.fund_transactions.id;


--
-- Name: funds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.funds (
    id integer NOT NULL,
    name text NOT NULL,
    fund_type text NOT NULL,
    account_id integer,
    bank_id integer,
    balance numeric(15,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: funds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.funds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: funds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.funds_id_seq OWNED BY public.funds.id;


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id integer NOT NULL,
    entry_number text NOT NULL,
    entry_date timestamp without time zone DEFAULT now() NOT NULL,
    description text NOT NULL,
    source_type text DEFAULT 'manual'::text NOT NULL,
    source_id integer,
    period_id integer,
    total_debit numeric(15,2) DEFAULT 0,
    total_credit numeric(15,2) DEFAULT 0,
    created_by integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: journal_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.journal_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: journal_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.journal_entries_id_seq OWNED BY public.journal_entries.id;


--
-- Name: journal_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_lines (
    id integer NOT NULL,
    entry_id integer NOT NULL,
    account_id integer NOT NULL,
    debit numeric(15,2) DEFAULT 0,
    credit numeric(15,2) DEFAULT 0,
    description text,
    fund_id integer
);


--
-- Name: journal_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.journal_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: journal_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.journal_lines_id_seq OWNED BY public.journal_lines.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type text DEFAULT 'info'::text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    related_order_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    service_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    user_input_id text NOT NULL,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now(),
    paid_amount integer
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: password_reset_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_codes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    code text NOT NULL,
    method text DEFAULT 'whatsapp'::text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: password_reset_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_codes_id_seq OWNED BY public.password_reset_codes.id;


--
-- Name: service_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_groups (
    id integer NOT NULL,
    name text NOT NULL,
    category_id integer NOT NULL,
    image text,
    note text,
    active boolean DEFAULT true,
    input_type text DEFAULT 'id'::text
);


--
-- Name: service_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_groups_id_seq OWNED BY public.service_groups.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name text NOT NULL,
    price integer NOT NULL,
    service_group_id integer NOT NULL,
    active boolean DEFAULT true
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    store_name text DEFAULT 'ويب ستور'::text,
    logo_url text,
    admin_whatsapp text,
    exchange_rate numeric(15,2) DEFAULT '1'::numeric,
    maintenance_enabled boolean DEFAULT false,
    maintenance_message text
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name text NOT NULL,
    phone_number text,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    balance integer DEFAULT 0,
    active boolean DEFAULT true,
    email text,
    currency text DEFAULT 'YER'::text,
    vip_group_id integer
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vip_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vip_groups (
    id integer NOT NULL,
    name text NOT NULL,
    global_discount numeric(5,2) DEFAULT '0'::numeric,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: vip_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vip_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vip_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vip_groups_id_seq OWNED BY public.vip_groups.id;


--
-- Name: vip_service_discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vip_service_discounts (
    id integer NOT NULL,
    vip_group_id integer NOT NULL,
    service_id integer NOT NULL,
    discount_percent numeric(5,2) NOT NULL
);


--
-- Name: vip_service_discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vip_service_discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vip_service_discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vip_service_discounts_id_seq OWNED BY public.vip_service_discounts.id;


--
-- Name: accounting_periods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods ALTER COLUMN id SET DEFAULT nextval('public.accounting_periods_id_seq'::regclass);


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: admin_activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_activity_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_activity_logs_id_seq'::regclass);


--
-- Name: ads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ads ALTER COLUMN id SET DEFAULT nextval('public.ads_id_seq'::regclass);


--
-- Name: api_order_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_order_logs ALTER COLUMN id SET DEFAULT nextval('public.api_order_logs_id_seq'::regclass);


--
-- Name: api_providers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_providers ALTER COLUMN id SET DEFAULT nextval('public.api_providers_id_seq'::regclass);


--
-- Name: api_service_mappings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_service_mappings ALTER COLUMN id SET DEFAULT nextval('public.api_service_mappings_id_seq'::regclass);


--
-- Name: api_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_tokens ALTER COLUMN id SET DEFAULT nextval('public.api_tokens_id_seq'::regclass);


--
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: deposit_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deposit_requests ALTER COLUMN id SET DEFAULT nextval('public.deposit_requests_id_seq'::regclass);


--
-- Name: fund_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_transactions ALTER COLUMN id SET DEFAULT nextval('public.fund_transactions_id_seq'::regclass);


--
-- Name: funds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funds ALTER COLUMN id SET DEFAULT nextval('public.funds_id_seq'::regclass);


--
-- Name: journal_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries ALTER COLUMN id SET DEFAULT nextval('public.journal_entries_id_seq'::regclass);


--
-- Name: journal_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines ALTER COLUMN id SET DEFAULT nextval('public.journal_lines_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: password_reset_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_codes ALTER COLUMN id SET DEFAULT nextval('public.password_reset_codes_id_seq'::regclass);


--
-- Name: service_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_groups ALTER COLUMN id SET DEFAULT nextval('public.service_groups_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vip_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_groups ALTER COLUMN id SET DEFAULT nextval('public.vip_groups_id_seq'::regclass);


--
-- Name: vip_service_discounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_service_discounts ALTER COLUMN id SET DEFAULT nextval('public.vip_service_discounts_id_seq'::regclass);


--
-- Data for Name: accounting_periods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounting_periods (id, year, month, period_type, status, closed_at, closed_by, created_at) FROM stdin;
1	2026	2	monthly	closed	2026-02-16 05:12:06.166	1	2026-02-16 04:30:00.858016
2	2026	2	monthly	open	\N	\N	2026-02-16 06:11:55.870478
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, code, name_ar, type, parent_id, is_active, created_at) FROM stdin;
1	1000	الأصول	asset	\N	t	2026-02-16 04:30:00.779722
2	1100	النقدية والبنوك	asset	\N	t	2026-02-16 04:30:00.792747
3	1101	الصندوق الرئيسي	asset	\N	t	2026-02-16 04:30:00.795257
4	1102	البنك	asset	\N	t	2026-02-16 04:30:00.797812
5	1200	المدينون	asset	\N	t	2026-02-16 04:30:00.800951
6	1201	ذمم العملاء	asset	\N	t	2026-02-16 04:30:00.804196
7	2000	الالتزامات	liability	\N	t	2026-02-16 04:30:00.807374
8	2100	الدائنون	liability	\N	t	2026-02-16 04:30:00.810472
9	2101	ذمم الموردين	liability	\N	t	2026-02-16 04:30:00.813648
10	3000	حقوق الملكية	equity	\N	t	2026-02-16 04:30:00.816214
11	3100	رأس المال	equity	\N	t	2026-02-16 04:30:00.819287
12	3200	الأرباح المحتجزة	equity	\N	t	2026-02-16 04:30:00.822384
13	4000	الإيرادات	revenue	\N	t	2026-02-16 04:30:00.824937
14	4100	إيرادات المبيعات	revenue	\N	t	2026-02-16 04:30:00.828013
15	4101	إيرادات شحن الألعاب	revenue	\N	t	2026-02-16 04:30:00.830839
16	4102	إيرادات الاشتراكات	revenue	\N	t	2026-02-16 04:30:00.833345
17	4103	إيرادات البطاقات	revenue	\N	t	2026-02-16 04:30:00.836067
18	5000	المصروفات	expense	\N	t	2026-02-16 04:30:00.83845
19	5100	تكلفة المبيعات	expense	\N	t	2026-02-16 04:30:00.840686
20	5101	تكلفة شحن الألعاب	expense	\N	t	2026-02-16 04:30:00.843075
21	5102	تكلفة الاشتراكات	expense	\N	t	2026-02-16 04:30:00.845275
22	5103	تكلفة البطاقات	expense	\N	t	2026-02-16 04:30:00.847891
23	5200	المصاريف التشغيلية	expense	\N	t	2026-02-16 04:30:00.84987
24	5201	رواتب وأجور	expense	\N	t	2026-02-16 04:30:00.851945
25	5202	إيجارات	expense	\N	t	2026-02-16 04:30:00.853795
26	5203	مصاريف متنوعة	expense	\N	t	2026-02-16 04:30:00.855862
\.


--
-- Data for Name: admin_activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_activity_logs (id, user_id, action, details, target_type, target_id, created_at) FROM stdin;
1	1	موافقة على تغذية رصيد	موافقة على تغذية 1000 ر.ي للمستخدم Admin User	deposit	1	2026-02-16 09:19:29.882107
\.


--
-- Data for Name: ads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ads (id, text, icon, active, image_url, link_url, ad_type) FROM stdin;
1	خصم 50% لفترة محدودة!	flame	t	\N	\N	text
\.


--
-- Data for Name: api_order_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_order_logs (id, order_id, provider_id, direction, request_data, response_data, external_order_id, external_reference, status, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: api_providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_providers (id, name, provider_type, base_url, username, password, api_token, is_active, webhook_url, ip_whitelist, balance, currency, notes, created_at) FROM stdin;
\.


--
-- Data for Name: api_service_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_service_mappings (id, provider_id, local_service_id, external_service_id, external_service_name, external_price, is_active, auto_forward, required_fields) FROM stdin;
\.


--
-- Data for Name: api_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_tokens (id, user_id, token, name, is_active, ip_whitelist, last_used_at, created_at) FROM stdin;
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banks (id, bank_name, account_name, account_number, note) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, icon, image) FROM stdin;
1	قسم التطبيقات	layout-grid	\N
2	قسم الألعاب	gamepad-2	\N
3	قسم الاشتراكات	tv	\N
4	قسم البطائق	credit-card	\N
\.


--
-- Data for Name: deposit_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deposit_requests (id, user_id, amount, receipt_url, status, fund_id, approved_by, approved_amount, rejection_reason, notes, created_at, updated_at) FROM stdin;
2	1	211313	/uploads/1771233251868-407034925.png	rejected	\N	\N	\N		\N	2026-02-16 09:14:24.304495	2026-02-16 09:19:22.093
1	1	1000	/uploads/1771233227558-548030469.png	approved	1	1	1000	\N		2026-02-16 09:14:04.046757	2026-02-16 09:19:29.826
\.


--
-- Data for Name: fund_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fund_transactions (id, fund_id, transaction_type, amount, description, related_entry_id, related_order_id, created_at) FROM stdin;
1	1	deposit	1000.00	تغذية رصيد Admin User	\N	\N	2026-02-16 09:19:29.875565
\.


--
-- Data for Name: funds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.funds (id, name, fund_type, account_id, bank_id, balance, is_active, created_at) FROM stdin;
1	محفضه جيب	bank	4	\N	0.00	t	2026-02-16 09:16:13.139481
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_entries (id, entry_number, entry_date, description, source_type, source_id, period_id, total_debit, total_credit, created_by, created_at) FROM stdin;
1	JE-000001	2026-02-16 06:11:55.874	إيراد طلب #3 - 2,000,000 جوهرة	order	3	2	5236.00	5236.00	1	2026-02-16 06:11:55.875561
2	JE-000002	2026-02-16 09:11:07.202	إيراد طلب #4 - آيتونز – 50 دولار	order	4	2	27552.00	27552.00	1	2026-02-16 09:11:07.203107
3	JE-000003	2026-02-16 09:19:29.857	تغذية رصيد Admin User - طلب #1	deposit	1	2	1000.00	1000.00	1	2026-02-16 09:19:29.857518
4	JE-000004	2026-02-16 09:25:07.973	إيراد طلب #5 - 450,000 جوهرة	order	5	2	1176.00	1176.00	1	2026-02-16 09:25:07.973816
\.


--
-- Data for Name: journal_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_lines (id, entry_id, account_id, debit, credit, description, fund_id) FROM stdin;
1	1	3	5236.00	0.00	\N	\N
2	1	14	0.00	5236.00	\N	\N
3	2	3	27552.00	0.00	\N	\N
4	2	14	0.00	27552.00	\N	\N
5	3	3	1000.00	0.00	\N	1
6	3	8	0.00	1000.00	\N	\N
7	4	3	1176.00	0.00	\N	\N
8	4	14	0.00	1176.00	\N	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, is_read, related_order_id, created_at) FROM stdin;
5	1	info	جاري تنفيذ طلبك	طلبك رقم #4 (آيتونز – 50 دولار) قيد التنفيذ الآن	t	4	2026-02-16 09:11:04.149165
4	1	order	طلب جديد	طلب جديد #4 من Admin User - آيتونز – 50 دولار	t	4	2026-02-16 09:10:25.693559
8	1	order	طلب تغذية رصيد جديد	المستخدم Admin User طلب تغذية رصيد بمبلغ 211,313 ر.ي	t	\N	2026-02-16 09:14:24.309402
7	1	order	طلب تغذية رصيد جديد	المستخدم Admin User طلب تغذية رصيد بمبلغ 1,000 ر.ي	t	\N	2026-02-16 09:14:04.057498
11	1	order	طلب جديد	طلب جديد #5 من Admin User - 450,000 جوهرة	t	5	2026-02-16 09:23:09.639632
9	1	error	تم رفض طلب التغذية	تم رفض طلب تغذية الرصيد	t	\N	2026-02-16 09:19:22.103947
10	1	success	تمت الموافقة على طلب التغذية	تم إضافة 1,000 ر.ي إلى رصيدك. رصيدك الحالي: 1,000 ر.ي	t	\N	2026-02-16 09:19:29.844598
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, user_id, service_id, status, user_input_id, rejection_reason, created_at, paid_amount) FROM stdin;
2	2	1	rejected	5456456		2026-02-16 03:50:25.052638	\N
1	2	1	rejected	5645645	غير متوفر حاليا	2026-02-16 03:47:58.220777	\N
3	1	8	completed	5456456	\N	2026-02-16 06:10:00.869872	\N
4	1	34	completed	456655646	\N	2026-02-16 09:10:25.681753	\N
5	1	3	completed	55555555	\N	2026-02-16 09:23:09.633404	\N
\.


--
-- Data for Name: password_reset_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_codes (id, user_id, code, method, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: service_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_groups (id, name, category_id, image, note, active, input_type) FROM stdin;
2	بوبجي موبايل العالمية	2	\N	الشحن عن طريق الايدي	t	id
3	شاهد في اي بي Shahid VIP	3	\N	يتم تجديد الاشتراك عبر إرسال الحساب (الإيميل)، ويتم التفعيل خلال وقت قصير من تأكيد الدفع	t	id
4	بطاقات آيتونز امريكي	4	\N	من خلال الكود ارسال كود البطاقه للعميل فقط	t	id
1	لاما لودو Lama Ludo	1	/uploads/1771234075057-585017890.png	شحن ماسات تطبيق لما لودو من خلال المعرف فقط	t	id
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, name, price, service_group_id, active) FROM stdin;
1	150,000 جوهرة	392	1	t
2	300,000 جوهرة	784	1	t
3	450,000 جوهرة	1176	1	t
4	600,000 جوهرة	1568	1	t
5	750,000 جوهرة	1960	1	t
6	900,000 جوهرة	2358	1	t
9	5,000,000 جوهرة	13082	1	t
10	10,000,000 جوهرة	26169	1	t
11	15,000,000 جوهرة	39250	1	t
12	60 شدة	491	2	t
13	325 شدة	2456	2	t
14	385 شدة	2947	2	t
15	660 شدة	4911	2	t
16	720 شدة	5402	2	t
17	1800 شدة	12279	2	t
18	3850 شدة	24557	2	t
19	8100 شدة	49113	2	t
20	8400 شدة	51569	2	t
21	11950 شدة	73669	2	t
22	16200 شدة	98226	2	t
23	24300 شدة	147339	2	t
24	32400 شدة	196452	2	t
25	شاهد VIP – 3 أشهر	15500	3	t
26	شاهد VIP – سنة كاملة	50000	3	t
27	آيتونز – 2 دولار	1103	4	t
28	آيتونز – 3 دولار	1652	4	t
29	آيتونز – 5 دولار	2755	4	t
30	آيتونز – 10 دولار	5510	4	t
31	آيتونز – 15 دولار	8266	4	t
32	آيتونز – 20 دولار	11021	4	t
33	آيتونز – 25 دولار	13776	4	t
34	آيتونز – 50 دولار	27552	4	t
35	آيتونز – 100 دولار	55104	4	t
7	1,000,000 جوهرة	2615	1	f
8	2,000,000 جوهرة	5236	1	f
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
Hv45hMpH01IQ3TZlK3c8ebO7lJmjQRxR	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2026-02-17 04:37:43
33JUPpH7UmbH-fCj2Oay3AHLhzI3xkFE	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2026-02-17 09:59:17
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, store_name, logo_url, admin_whatsapp, exchange_rate, maintenance_enabled, maintenance_message) FROM stdin;
1	ويب ستور	/logo.png	967775477340	1.00	f	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, full_name, phone_number, password, role, created_at, balance, active, email, currency, vip_group_id) FROM stdin;
2	احمد شوقي عبده قائد الحكيمي 	775477340	6f7450ca81188fb1f8dade6c5399eae0442f5acbfd0cfd26cfd07432a6fb0170d42aa980da072d82ad184f42ecb747c15b1cfb376c3ee086192f3751150b4d17.2acbdf17ccc8110b7e8bbebb9d7942f1	user	2026-02-16 03:47:48.648852	0	t	\N	USD	\N
1	Admin User	0000000000	5afb8731e7a30693604e80f8d0b5a6bca116d56acc65e63436c047ea08ce4454fcf114c1f49ca74d4a1e1c861ba45b953ebee02f55aaa069ecf66a15892e2fec.52094f69a585456fae4e5f5d4a1ddb18	admin	2026-02-16 03:01:40.181934	1000	t	Webstorbot2030@gmail.com	YER	\N
\.


--
-- Data for Name: vip_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vip_groups (id, name, global_discount, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: vip_service_discounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vip_service_discounts (id, vip_group_id, service_id, discount_percent) FROM stdin;
\.


--
-- Name: accounting_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accounting_periods_id_seq', 2, true);


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accounts_id_seq', 26, true);


--
-- Name: admin_activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_activity_logs_id_seq', 1, true);


--
-- Name: ads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ads_id_seq', 2, true);


--
-- Name: api_order_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_order_logs_id_seq', 1, false);


--
-- Name: api_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_providers_id_seq', 1, false);


--
-- Name: api_service_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_service_mappings_id_seq', 1, false);


--
-- Name: api_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_tokens_id_seq', 1, false);


--
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.banks_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 4, true);


--
-- Name: deposit_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.deposit_requests_id_seq', 2, true);


--
-- Name: fund_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fund_transactions_id_seq', 1, true);


--
-- Name: funds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.funds_id_seq', 1, true);


--
-- Name: journal_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.journal_entries_id_seq', 4, true);


--
-- Name: journal_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.journal_lines_id_seq', 8, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 13, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 5, true);


--
-- Name: password_reset_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_codes_id_seq', 1, false);


--
-- Name: service_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_groups_id_seq', 4, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.services_id_seq', 35, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: vip_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vip_groups_id_seq', 1, false);


--
-- Name: vip_service_discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vip_service_discounts_id_seq', 1, false);


--
-- Name: accounting_periods accounting_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods
    ADD CONSTRAINT accounting_periods_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_code_key UNIQUE (code);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: admin_activity_logs admin_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_activity_logs
    ADD CONSTRAINT admin_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: api_order_logs api_order_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_order_logs
    ADD CONSTRAINT api_order_logs_pkey PRIMARY KEY (id);


--
-- Name: api_providers api_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_providers
    ADD CONSTRAINT api_providers_pkey PRIMARY KEY (id);


--
-- Name: api_service_mappings api_service_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_service_mappings
    ADD CONSTRAINT api_service_mappings_pkey PRIMARY KEY (id);


--
-- Name: api_tokens api_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_pkey PRIMARY KEY (id);


--
-- Name: api_tokens api_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_token_key UNIQUE (token);


--
-- Name: banks banks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: deposit_requests deposit_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deposit_requests
    ADD CONSTRAINT deposit_requests_pkey PRIMARY KEY (id);


--
-- Name: fund_transactions fund_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_transactions
    ADD CONSTRAINT fund_transactions_pkey PRIMARY KEY (id);


--
-- Name: funds funds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT funds_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_lines journal_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_codes password_reset_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_codes
    ADD CONSTRAINT password_reset_codes_pkey PRIMARY KEY (id);


--
-- Name: service_groups service_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_groups
    ADD CONSTRAINT service_groups_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_phone_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_unique UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vip_groups vip_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_groups
    ADD CONSTRAINT vip_groups_pkey PRIMARY KEY (id);


--
-- Name: vip_service_discounts vip_service_discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_service_discounts
    ADD CONSTRAINT vip_service_discounts_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: accounting_periods accounting_periods_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods
    ADD CONSTRAINT accounting_periods_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.users(id);


--
-- Name: admin_activity_logs admin_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_activity_logs
    ADD CONSTRAINT admin_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: api_order_logs api_order_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_order_logs
    ADD CONSTRAINT api_order_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: api_order_logs api_order_logs_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_order_logs
    ADD CONSTRAINT api_order_logs_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.api_providers(id);


--
-- Name: api_service_mappings api_service_mappings_local_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_service_mappings
    ADD CONSTRAINT api_service_mappings_local_service_id_fkey FOREIGN KEY (local_service_id) REFERENCES public.services(id);


--
-- Name: api_service_mappings api_service_mappings_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_service_mappings
    ADD CONSTRAINT api_service_mappings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.api_providers(id);


--
-- Name: api_tokens api_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: deposit_requests deposit_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deposit_requests
    ADD CONSTRAINT deposit_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: deposit_requests deposit_requests_fund_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deposit_requests
    ADD CONSTRAINT deposit_requests_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES public.funds(id);


--
-- Name: deposit_requests deposit_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deposit_requests
    ADD CONSTRAINT deposit_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: fund_transactions fund_transactions_fund_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_transactions
    ADD CONSTRAINT fund_transactions_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES public.funds(id);


--
-- Name: fund_transactions fund_transactions_related_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_transactions
    ADD CONSTRAINT fund_transactions_related_entry_id_fkey FOREIGN KEY (related_entry_id) REFERENCES public.journal_entries(id);


--
-- Name: fund_transactions fund_transactions_related_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fund_transactions
    ADD CONSTRAINT fund_transactions_related_order_id_fkey FOREIGN KEY (related_order_id) REFERENCES public.orders(id);


--
-- Name: funds funds_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT funds_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: funds funds_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT funds_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: journal_entries journal_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: journal_entries journal_entries_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.accounting_periods(id);


--
-- Name: journal_lines journal_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: journal_lines journal_lines_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.journal_entries(id);


--
-- Name: journal_lines journal_lines_fund_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES public.funds(id);


--
-- Name: notifications notifications_related_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_order_id_fkey FOREIGN KEY (related_order_id) REFERENCES public.orders(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: orders orders_service_id_services_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_service_id_services_id_fk FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: password_reset_codes password_reset_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_codes
    ADD CONSTRAINT password_reset_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: service_groups service_groups_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_groups
    ADD CONSTRAINT service_groups_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: services services_service_group_id_service_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_service_group_id_service_groups_id_fk FOREIGN KEY (service_group_id) REFERENCES public.service_groups(id);


--
-- Name: users users_vip_group_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_vip_group_id_fk FOREIGN KEY (vip_group_id) REFERENCES public.vip_groups(id);


--
-- Name: vip_service_discounts vip_service_discounts_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_service_discounts
    ADD CONSTRAINT vip_service_discounts_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: vip_service_discounts vip_service_discounts_vip_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vip_service_discounts
    ADD CONSTRAINT vip_service_discounts_vip_group_id_fkey FOREIGN KEY (vip_group_id) REFERENCES public.vip_groups(id);


--
-- PostgreSQL database dump complete
--

\unrestrict HkTUxdx3HMBNvWZTHVLjVFcJCmF5jVO1qIs9cO2OiGCxIHZy7yF0L1jjwd5ylp2

