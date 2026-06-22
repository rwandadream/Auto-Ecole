-- =====================================================
-- EXTENSIONS
-- =====================================================

create extension if not exists "uuid-ossp";


-- =====================================================
-- PROFILS UTILISATEURS
-- =====================================================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text,

  role text check (
    role in (
      'administrateur_principal',
      'administrateur_secondaire',
      'comptable',
      'moniteur',
      'conseiller'
    )
  ) default 'conseiller',

  created_at timestamptz default now()
);



-- =====================================================
-- PERMIS
-- =====================================================

create table public.permis (
 id uuid default uuid_generate_v4() primary key,
 code text unique not null,
 libelle text not null,
 created_at timestamptz default now()
);


insert into public.permis(code,libelle)
values
('A','Moto'),
('B','Voiture'),
('AB','Moto + Voiture');



-- =====================================================
-- INSPECTEURS
-- =====================================================

create table public.inspecteurs (

 id uuid default uuid_generate_v4() primary key,

 nom text not null,
 prenom text not null,

 telephone text,
 email text,

 actif boolean default true,

 created_at timestamptz default now()
);



-- =====================================================
-- MONITEURS
-- =====================================================

create table public.moniteurs (

 id uuid default uuid_generate_v4() primary key,

 nom text not null,
 prenom text not null,

 telephone text not null,
 email text,

 specialite text,

 statut text default 'Disponible',

 created_at timestamptz default now()
);



-- =====================================================
-- VEHICULES
-- =====================================================


create table public.vehicules (

id uuid default uuid_generate_v4() primary key,

marque text,
modele text,

immatriculation text unique not null,

etat text default 'Disponible',

created_at timestamptz default now()

);



-- =====================================================
-- ELEVES
-- =====================================================


create table public.eleves (

id uuid default uuid_generate_v4() primary key,


nom text not null,
prenom text not null,


telephone text not null,
email text,


adresse text,


date_naissance date,
lieu_naissance text,


sexe text,
nationalite text,


type_piece text,
num_piece text,


permis_id uuid references permis(id),


statut text check(
statut in(
'prospect',
'inscrit',
'en_formation',
'examen',
'admis',
'ajourne',
'termine',
'abandon'
)
)
default 'prospect',



inspecteur_id uuid references inspecteurs(id),



est_parraine boolean default false,

parrain_nom text,


photo_cni text,
photo_profil text,


notes text,


date_inscription date default current_date,


created_at timestamptz default now()

);




-- =====================================================
-- FORMATIONS
-- =====================================================


create table public.formations (

id uuid default uuid_generate_v4() primary key,

nom text not null,

description text,

prix numeric(12,0) default 0,

actif boolean default true,

created_at timestamptz default now()

);




-- =====================================================
-- INSCRIPTIONS
-- =====================================================


create table public.inscriptions (

id uuid default uuid_generate_v4() primary key,


eleve_id uuid references eleves(id)
on delete cascade,


formation_id uuid references formations(id)
on delete set null,


tarif numeric(12,0) not null,


date_inscription date default current_date,


created_at timestamptz default now()

);




-- =====================================================
-- EXAMENS
-- =====================================================


create table public.examens (

id uuid default uuid_generate_v4() primary key,


eleve_id uuid references eleves(id)
on delete cascade,


inspecteur_id uuid references inspecteurs(id),


type_examen text not null,


date_examen date not null,


resultat text default 'en_attente'
check(
resultat in(
'en_attente',
'admis',
'ajourne'
)
),


notes text,


created_at timestamptz default now()

);





-- =====================================================
-- SEANCES CONDUITE
-- =====================================================


create table public.seances (

id uuid default uuid_generate_v4() primary key,


eleve_id uuid references eleves(id)
on delete cascade,


moniteur_id uuid references moniteurs(id),


vehicule_id uuid references vehicules(id),


date_seance date,


heure_debut time,


heure_fin time,


statut text default 'planifie',


notes text,


created_at timestamptz default now()

);





-- =====================================================
-- FACTURES
-- =====================================================


create table public.factures (

id uuid default uuid_generate_v4() primary key,


numero text unique not null,


eleve_id uuid references eleves(id),


inscription_id uuid references inscriptions(id),


montant numeric(12,0) not null,


statut text default 'impayee'
check(
statut in(
'impayee',
'partielle',
'payee'
)
),


date_emission date default current_date,


created_at timestamptz default now()

);





-- =====================================================
-- PAIEMENTS
-- =====================================================


create table public.paiements (

id uuid default uuid_generate_v4() primary key,


facture_id uuid references factures(id)
on delete cascade,


montant numeric(12,0) not null,


mode_paiement text,


reference text,


notes text,


date_paiement date default current_date,


created_at timestamptz default now()

);






-- =====================================================
-- DEPENSES COMPTABILITE
-- =====================================================


create table public.depenses (

id uuid default uuid_generate_v4() primary key,


categorie text not null,


montant numeric(12,0) not null,


description text,


mode_paiement text,


vehicule_id uuid references vehicules(id),


utilisateur_id uuid references auth.users(id),


justificatif_url text,


date_depense date default current_date,


created_at timestamptz default now()

);







-- =====================================================
-- AUDIT
-- =====================================================


create table public.audit_log (

id uuid default uuid_generate_v4() primary key,


action text not null,

entity text not null,


entity_id uuid,


user_id uuid,


old_data jsonb,

new_data jsonb,


created_at timestamptz default now()

);





-- =====================================================
-- RLS - ENABLE
-- =====================================================


alter table public.profiles enable row level security;
alter table public.permis enable row level security;
alter table public.eleves enable row level security;
alter table public.formations enable row level security;
alter table public.inscriptions enable row level security;
alter table public.factures enable row level security;
alter table public.paiements enable row level security;
alter table public.examens enable row level security;
alter table public.moniteurs enable row level security;
alter table public.inspecteurs enable row level security;
alter table public.vehicules enable row level security;
alter table public.seances enable row level security;
alter table public.depenses enable row level security;
alter table public.audit_log enable row level security;



-- =====================================================
-- RLS - POLICIES
-- =====================================================

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('administrateur_principal', 'administrateur_secondaire')
  );
end;
$$ language plpgsql security definer;


-- PROFILES: Users can read their own profile, admins can read all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());
create policy "Admins can update profiles" on public.profiles for update using (public.is_admin());


-- PERMIS & FORMATIONS: Authenticated users can read, admins can manage
create policy "Authenticated users can view permis" on public.permis for select using (auth.role() = 'authenticated');
create policy "Admins can manage permis" on public.permis for all using (public.is_admin());

create policy "Authenticated users can view formations" on public.formations for select using (auth.role() = 'authenticated');
create policy "Admins can manage formations" on public.formations for all using (public.is_admin());


-- ELEVES, MONITEURS, INSPECTEURS, VEHICULES: Read for all staff, full access for admins
create policy "Staff can view eleves" on public.eleves for select using (auth.role() = 'authenticated');
create policy "Admins can manage eleves" on public.eleves for all using (public.is_admin());

create policy "Staff can view moniteurs" on public.moniteurs for select using (auth.role() = 'authenticated');
create policy "Admins can manage moniteurs" on public.moniteurs for all using (public.is_admin());

create policy "Staff can view inspecteurs" on public.inspecteurs for select using (auth.role() = 'authenticated');
create policy "Admins can manage inspecteurs" on public.inspecteurs for all using (public.is_admin());

create policy "Staff can view vehicules" on public.vehicules for select using (auth.role() = 'authenticated');
create policy "Admins can manage vehicules" on public.vehicules for all using (public.is_admin());


-- INSCRIPTIONS, EXAMENS, SEANCES: Read for all staff, full access for admins
create policy "Staff can view inscriptions" on public.inscriptions for select using (auth.role() = 'authenticated');
create policy "Admins can manage inscriptions" on public.inscriptions for all using (public.is_admin());

create policy "Staff can view examens" on public.examens for select using (auth.role() = 'authenticated');
create policy "Admins can manage examens" on public.examens for all using (public.is_admin());

create policy "Staff can view seances" on public.seances for select using (auth.role() = 'authenticated');
create policy "Admins can manage seances" on public.seances for all using (public.is_admin());


-- FACTURES, PAIEMENTS: Read/Write for admins and comptables
create policy "Admins and comptables can manage factures" on public.factures
  for all using (
    public.is_admin() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'comptable')
  );

create policy "Admins and comptables can manage paiements" on public.paiements
  for all using (
    public.is_admin() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'comptable')
  );


-- DEPENSES: Read/Write for admins and comptables
create policy "Admins and comptables can manage depenses" on public.depenses
  for all using (
    public.is_admin() or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'comptable')
  );


-- AUDIT LOG: Only admins can view
create policy "Only admins can view audit logs" on public.audit_log for select using (public.is_admin());



-- =====================================================
-- CREATION AUTOMATIQUE PROFILE
-- =====================================================


create or replace function public.handle_new_user()

returns trigger

language plpgsql

security definer

as $$

begin

insert into public.profiles(
id,
email,
name
)

values(
new.id,
new.email,
new.raw_user_meta_data->>'name'
);


return new;

end;

$$;



create trigger on_auth_user_created

after insert on auth.users

for each row

execute procedure public.handle_new_user();
