-- Seed de référence métier SARAH AUTO (données initiales dev/staging)
INSERT INTO public.permis (code, libelle) VALUES ('C', 'Poids lourd') ON CONFLICT (code) DO NOTHING;

INSERT INTO public.formations (id, nom, description, prix, actif) VALUES
('11111111-1111-4111-8111-111111111101', 'Pack Permis B standard', '20h conduite + code illimité', 350000, true),
('11111111-1111-4111-8111-111111111102', 'Pack Permis A moto', '15h conduite + code moto', 280000, true),
('11111111-1111-4111-8111-111111111103', 'Pack Permis B premium', '30h conduite + code + examen blanc', 480000, true),
('11111111-1111-4111-8111-111111111104', 'Code seul', 'Préparation au code de la route', 50000, true),
('11111111-1111-4111-8111-111111111105', 'Pack Permis AB complet', 'Moto + Voiture, 40h conduite', 620000, false)
ON CONFLICT (id) DO UPDATE SET nom=EXCLUDED.nom, prix=EXCLUDED.prix;

INSERT INTO public.moniteurs (id, nom, prenom, telephone, email, specialite, statut) VALUES
('22222222-2222-4222-8222-222222222201', 'Koffi', 'Jean-Marc', '+225 07 11 22 33', 'jm.koffi@sarahauto.ci', 'Conduite', 'Disponible'),
('22222222-2222-4222-8222-222222222202', 'Yao', 'Marie-Adèle', '+225 05 44 55 66', 'ma.yao@sarahauto.ci', 'Conduite', 'En mission'),
('22222222-2222-4222-8222-222222222203', 'Brou', 'Franck', '+225 01 77 88 99', 'f.brou@sarahauto.ci', 'Code', 'Disponible'),
('22222222-2222-4222-8222-222222222204', 'Adjoua', 'Christelle', '+225 07 22 33 44', 'c.adjoua@sarahauto.ci', 'Conduite', 'Disponible'),
('22222222-2222-4222-8222-222222222205', 'Konan', 'Didier', '+225 05 66 77 88', 'd.konan@sarahauto.ci', 'Conduite', 'Absent'),
('22222222-2222-4222-8222-222222222206', 'Aya', 'Sandrine', '+225 01 99 00 11', 's.aya@sarahauto.ci', 'Code', 'Disponible')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.inspecteurs (id, nom, prenom, telephone, email, actif) VALUES
('33333333-3333-4333-8333-333333333301', 'N''Guessan', 'Paul', '+225 07 01 02 03', 'p.nguessan@examen.gouv.ci', true),
('33333333-3333-4333-8333-333333333302', 'Coulibaly', 'Aminata', '+225 05 04 05 06', 'a.coulibaly@examen.gouv.ci', true),
('33333333-3333-4333-8333-333333333303', 'Diabaté', 'Mamadou', '+225 01 07 08 09', 'm.diabate@examen.gouv.ci', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vehicules (id, marque, modele, immatriculation, etat) VALUES
('44444444-4444-4444-8444-444444444401', 'Toyota', 'Yaris', 'AB-1247-CI', 'Disponible'),
('44444444-4444-4444-8444-444444444402', 'Peugeot', '208', 'CD-3389-CI', 'Disponible'),
('44444444-4444-4444-8444-444444444403', 'Renault', 'Clio', 'EF-5502-CI', 'En maintenance'),
('44444444-4444-4444-8444-444444444404', 'Hyundai', 'i20', 'GH-7714-CI', 'Disponible'),
('44444444-4444-4444-8444-444444444405', 'Yamaha', 'YZF-R3', 'IJ-9025-CI', 'Disponible'),
('44444444-4444-4444-8444-444444444406', 'Volkswagen', 'Polo', 'KL-1183-CI', 'En panne')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.eleves (id,code,dossier_code,nom,prenom,telephone,email,adresse,date_naissance,lieu_naissance,sexe,nationalite,type_piece,num_piece,type_permis,statut,date_inscription,seances_faites,seances_totales,est_parraine,parrain_nom,moniteur_id) VALUES
('55555555-5555-4555-8555-555555555501','EL-2401','EL-2401','Koné','Aminata','+225 07 12 34 56','aminata.kone@email.com','Cocody, Abidjan','1998-04-12','Bouaké','F','Ivoirienne','CNI','CNI-998877','B','en_formation','2026-12-02',12,20,false,'','22222222-2222-4222-8222-222222222201'),
('55555555-5555-4555-8555-555555555502','EL-2402','EL-2402','Traoré','Moussa','+225 05 98 76 54','moussa.traore@email.com','Yopougon, Abidjan','1995-09-23','Korhogo','M','Ivoirienne','CNI','CNI-445566','A','admis','2026-12-01',20,20,false,'','22222222-2222-4222-8222-222222222204'),
('55555555-5555-4555-8555-555555555503','EL-2403','EL-2403','Bamba','Fatou','+225 01 23 45 67','fatou.bamba@email.com','Marcory, Abidjan','2000-01-15','Daloa','F','Ivoirienne','CNI','CNI-112233','B','examen','2026-11-30',18,20,true,'Moussa Traoré','22222222-2222-4222-8222-222222222201'),
('55555555-5555-4555-8555-555555555504','EL-2404','EL-2404','Cissé','Ibrahim','+225 07 44 55 66','ibrahim.cisse@email.com','Plateau, Abidjan','1993-07-30','Abidjan','M','Ivoirienne','CNI','CNI-778899','AB','inscrit','2026-11-29',0,40,false,'',NULL),
('55555555-5555-4555-8555-555555555505','EL-2405','EL-2405','Diop','Awa','+225 05 77 88 99','awa.diop@email.com','Treichville, Abidjan','1997-11-08','Yamoussoukro','F','Sénégalaise','Passeport','PAS-556677','B','ajourne','2026-11-28',20,20,false,'','22222222-2222-4222-8222-222222222202'),
('55555555-5555-4555-8555-555555555506','EL-2406','EL-2406','Camara','Sékou','+225 01 33 44 55','sekou.camara@email.com','Adjamé, Abidjan','1999-03-19','Man','M','Guinéenne','CNI','CNI-223344','A','en_formation','2026-11-27',8,15,true,'Aminata Koné','22222222-2222-4222-8222-222222222204'),
('55555555-5555-4555-8555-555555555507','EL-2407','EL-2407','Touré','Mariam','+225 07 66 77 88','mariam.toure@email.com','Abobo, Abidjan','2001-06-25','Abidjan','F','Ivoirienne','CNI','CNI-334455','B','prospect','2026-11-26',0,20,false,'',NULL),
('55555555-5555-4555-8555-555555555508','EL-2408','EL-2408','Fall','Cheikh','+225 05 11 22 33','cheikh.fall@email.com','Bouaké centre','1994-12-03','Bouaké','M','Ivoirienne','CNI','CNI-667788','B','termine','2026-11-20',20,20,false,'','22222222-2222-4222-8222-222222222201'),
('55555555-5555-4555-8555-555555555509','EL-2409','EL-2409','Sangaré','Aïcha','+225 01 55 66 77','aicha.sangare@email.com','Katiola','1996-08-17','Katiola','F','Ivoirienne','CNI','CNI-990011','AB','en_formation','2026-11-18',15,40,true,'Cheikh Fall','22222222-2222-4222-8222-222222222205'),
('55555555-5555-4555-8555-555555555510','EL-2410','EL-2410','Ouattara','Bakary','+225 07 88 99 00','bakary.ouattara@email.com','Anyama','1992-02-28','Abidjan','M','Ivoirienne','CNI','CNI-445500','B','abandon','2026-11-10',5,20,false,'','22222222-2222-4222-8222-222222222202')
ON CONFLICT (id) DO UPDATE SET code=EXCLUDED.code, statut=EXCLUDED.statut, moniteur_id=EXCLUDED.moniteur_id;

INSERT INTO public.inscriptions (id,eleve_id,formation_id,tarif,date_inscription) VALUES
('66666666-6666-4666-8666-666666666601','55555555-5555-4555-8555-555555555504','11111111-1111-4111-8111-111111111105',620000,'2026-11-29'),
('66666666-6666-4666-8666-666666666602','55555555-5555-4555-8555-555555555506','11111111-1111-4111-8111-111111111102',280000,'2026-11-27'),
('66666666-6666-4666-8666-666666666603','55555555-5555-4555-8555-555555555505','11111111-1111-4111-8111-111111111103',480000,'2026-11-28'),
('66666666-6666-4666-8666-666666666604','55555555-5555-4555-8555-555555555507','11111111-1111-4111-8111-111111111101',350000,'2026-11-26'),
('66666666-6666-4666-8666-666666666605','55555555-5555-4555-8555-555555555508','11111111-1111-4111-8111-111111111101',350000,'2026-11-20'),
('66666666-6666-4666-8666-666666666606','55555555-5555-4555-8555-555555555501','11111111-1111-4111-8111-111111111101',350000,'2026-12-02'),
('66666666-6666-4666-8666-666666666607','55555555-5555-4555-8555-555555555502','11111111-1111-4111-8111-111111111102',280000,'2026-12-01'),
('66666666-6666-4666-8666-666666666608','55555555-5555-4555-8555-555555555503','11111111-1111-4111-8111-111111111101',350000,'2026-11-30'),
('66666666-6666-4666-8666-666666666609','55555555-5555-4555-8555-555555555509','11111111-1111-4111-8111-111111111105',620000,'2026-11-18')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.factures (id,numero,eleve_id,inscription_id,montant,statut,date_emission) VALUES
('77777777-7777-4777-8777-777777777701','FAC-2026-0142','55555555-5555-4555-8555-555555555504','66666666-6666-4666-8666-666666666601',620000,'partielle','2026-11-29'),
('77777777-7777-4777-8777-777777777702','FAC-2026-0138','55555555-5555-4555-8555-555555555506','66666666-6666-4666-8666-666666666602',280000,'partielle','2026-11-27'),
('77777777-7777-4777-8777-777777777703','FAC-2026-0135','55555555-5555-4555-8555-555555555505','66666666-6666-4666-8666-666666666603',480000,'impayee','2026-11-28'),
('77777777-7777-4777-8777-777777777704','FAC-2026-0129','55555555-5555-4555-8555-555555555507','66666666-6666-4666-8666-666666666604',350000,'partielle','2026-11-26'),
('77777777-7777-4777-8777-777777777705','FAC-2026-0124','55555555-5555-4555-8555-555555555508','66666666-6666-4666-8666-666666666605',350000,'impayee','2026-11-20'),
('77777777-7777-4777-8777-777777777706','FAC-2026-0120','55555555-5555-4555-8555-555555555501','66666666-6666-4666-8666-666666666606',350000,'partielle','2026-12-02'),
('77777777-7777-4777-8777-777777777707','FAC-2026-0118','55555555-5555-4555-8555-555555555502','66666666-6666-4666-8666-666666666607',280000,'payee','2026-12-01'),
('77777777-7777-4777-8777-777777777708','FAC-2026-0115','55555555-5555-4555-8555-555555555503','66666666-6666-4666-8666-666666666608',350000,'partielle','2026-11-30'),
('77777777-7777-4777-8777-777777777709','FAC-2026-0110','55555555-5555-4555-8555-555555555509','66666666-6666-4666-8666-666666666609',620000,'partielle','2026-11-18')
ON CONFLICT (id) DO UPDATE SET statut=EXCLUDED.statut;

INSERT INTO public.paiements (id,facture_id,eleve_id,montant,mode_paiement,reference,date_paiement) VALUES
('88888888-8888-4888-8888-888888888801','77777777-7777-4777-8777-777777777701','55555555-5555-4555-8555-555555555504',500000,'virement','VIR-9988','2026-11-29'),
('88888888-8888-4888-8888-888888888802','77777777-7777-4777-8777-777777777702','55555555-5555-4555-8555-555555555506',200000,'orange_money','OM-554433','2026-11-27'),
('88888888-8888-4888-8888-888888888803','77777777-7777-4777-8777-777777777703','55555555-5555-4555-8555-555555555505',130000,'wave','WV-221100','2026-11-28'),
('88888888-8888-4888-8888-888888888804','77777777-7777-4777-8777-777777777704','55555555-5555-4555-8555-555555555507',110000,'especes','ESP-0078','2026-11-26'),
('88888888-8888-4888-8888-888888888805','77777777-7777-4777-8777-777777777706','55555555-5555-4555-8555-555555555501',305000,'orange_money','OM-110099','2026-12-02'),
('88888888-8888-4888-8888-888888888806','77777777-7777-4777-8777-777777777707','55555555-5555-4555-8555-555555555502',280000,'wave','WV-778866','2026-12-01'),
('88888888-8888-4888-8888-888888888807','77777777-7777-4777-8777-777777777708','55555555-5555-4555-8555-555555555503',335000,'virement','VIR-4455','2026-11-30'),
('88888888-8888-4888-8888-888888888808','77777777-7777-4777-8777-777777777709','55555555-5555-4555-8555-555555555509',555000,'orange_money','OM-332211','2026-11-18')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.seances (id,eleve_id,moniteur_id,vehicule_id,date_seance,heure_debut,heure_fin,duree_minutes,statut,lieu,notes) VALUES
('99999999-9999-4999-8999-999999999901','55555555-5555-4555-8555-555555555501','22222222-2222-4222-8222-222222222201','44444444-4444-4444-8444-444444444401','2026-12-02','08:00','09:30',90,'effectue','SARAH AUTO — Cocody','Bien, progression satisfaisante'),
('99999999-9999-4999-8999-999999999902','55555555-5555-4555-8555-555555555502','22222222-2222-4222-8222-222222222204','44444444-4444-4444-8444-444444444405','2026-12-02','10:00','11:00',60,'effectue','SARAH AUTO — Cocody','Examen réussi'),
('99999999-9999-4999-8999-999999999903','55555555-5555-4555-8555-555555555503','22222222-2222-4222-8222-222222222201','44444444-4444-4444-8444-444444444402','2026-12-03','14:00','15:30',90,'planifie','SARAH AUTO — Cocody',''),
('99999999-9999-4999-8999-999999999904','55555555-5555-4555-8555-555555555506','22222222-2222-4222-8222-222222222204','44444444-4444-4444-8444-444444444404','2026-12-03','16:00','17:00',60,'planifie','SARAH AUTO — Cocody',''),
('99999999-9999-4999-8999-999999999905','55555555-5555-4555-8555-555555555505','22222222-2222-4222-8222-222222222202','44444444-4444-4444-8444-444444444401','2026-12-01','09:00','10:30',90,'absent_eleve','SARAH AUTO — Cocody','Élève absent'),
('99999999-9999-4999-8999-999999999906','55555555-5555-4555-8555-555555555509','22222222-2222-4222-8222-222222222205','44444444-4444-4444-8444-444444444402','2026-12-04','08:00','09:00',60,'planifie','SARAH AUTO — Cocody',''),
('99999999-9999-4999-8999-999999999907','55555555-5555-4555-8555-555555555501','22222222-2222-4222-8222-222222222201','44444444-4444-4444-8444-444444444401','2026-12-04','10:00','11:30',90,'planifie','SARAH AUTO — Cocody',''),
('99999999-9999-4999-8999-999999999908','55555555-5555-4555-8555-555555555510','22222222-2222-4222-8222-222222222202','44444444-4444-4444-8444-444444444403','2026-11-28','14:00','15:00',60,'annule','SARAH AUTO — Cocody','Annulé maintenance')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.examens (id,eleve_id,type_examen,type_permis,date_examen,inspecteur_id,resultat,notes) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','55555555-5555-4555-8555-555555555502','Conduite','A','2026-12-01','33333333-3333-4333-8333-333333333301','admis','Très bonne prestation'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02','55555555-5555-4555-8555-555555555505','Conduite','B','2026-11-25','33333333-3333-4333-8333-333333333302','echec','Échec manœuvres'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03','55555555-5555-4555-8555-555555555503','Code','B','2026-11-20',NULL,'admis','Code 35/40'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04','55555555-5555-4555-8555-555555555508','Conduite','B','2026-11-15','33333333-3333-4333-8333-333333333301','admis','Premier coup'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05','55555555-5555-4555-8555-555555555506','Code','A','2026-12-05',NULL,'en_attente','Session planifiée')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.examen_sessions (id,numero_bordereau,titre,type_examen,date_examen,heure_examen,centre,lieu,categorie,statut,inspecteur_id,vehicule_id) VALUES
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001','BORD-2026-018','Session Code — Cocody','Code','2026-12-05','08:00','Centre d''examen de Cocody','Centre d''examen de Cocody','B','programmée','33333333-3333-4333-8333-333333333302',NULL),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb002','BORD-2026-017','Session Conduite — Yopougon','Conduite','2026-11-25','07:30','Centre d''examen de Yopougon','Centre d''examen de Yopougon','B','terminée','33333333-3333-4333-8333-333333333301','44444444-4444-4444-8444-444444444401'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb003','BORD-2026-016','Session Code — Cocody','Code','2026-11-10','08:00','Centre d''examen de Cocody','Centre d''examen de Cocody','B','terminée','33333333-3333-4333-8333-333333333302',NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.examen_session_eleves (session_id,eleve_id,nom_complet,identifiant,telephone,categorie_permis,resultat) VALUES
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001','55555555-5555-4555-8555-555555555506','Sékou Camara','EL-2406','+225 01 33 44 55','A','en_attente'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001','55555555-5555-4555-8555-555555555507','Mariam Touré','EL-2407','+225 07 66 77 88','B','en_attente'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001','55555555-5555-4555-8555-555555555504','Ibrahim Cissé','EL-2404','+225 07 44 55 66','AB','en_attente'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001','55555555-5555-4555-8555-555555555509','Aïcha Sangaré','EL-2409','+225 01 55 66 77','AB','en_attente'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb002','55555555-5555-4555-8555-555555555505','Awa Diop','EL-2405','+225 05 77 88 99','B','echec'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb002','55555555-5555-4555-8555-555555555508','Cheikh Fall','EL-2408','+225 05 11 22 33','B','admis'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb002','55555555-5555-4555-8555-555555555502','Moussa Traoré','EL-2402','+225 05 98 76 54','A','admis'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb003','55555555-5555-4555-8555-555555555503','Fatou Bamba','EL-2403','+225 01 23 45 67','B','admis'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb003','55555555-5555-4555-8555-555555555510','Bakary Ouattara','EL-2410','+225 07 88 99 00','B','echec')
ON CONFLICT (session_id, eleve_id) DO NOTHING;

INSERT INTO public.depenses (id,categorie,montant,description,mode_paiement,vehicule_id,date_depense) VALUES
('cccccccc-cccc-4ccc-8ccc-cccccccccc01','carburant',45000,'Plein Toyota Yaris','especes','44444444-4444-4444-8444-444444444401','2026-11-15'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc02','entretien',85000,'Vidange Renault Clio','orange_money','44444444-4444-4444-8444-444444444403','2026-11-15'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc03','salaires',1200000,'Salaires moniteurs Novembre','virement',NULL,'2026-11-30'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc04','assurance',320000,'Assurance flotte trimestrielle','virement',NULL,'2026-11-05'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc05','reparations',175000,'Embrayage VW Polo','wave','44444444-4444-4444-8444-444444444406','2026-11-18'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc06','carburant',38000,'Plein Peugeot 208','especes','44444444-4444-4444-8444-444444444402','2026-11-08'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc07','fournitures',25000,'Plaquettes cours code','especes',NULL,'2026-11-10'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc08','carburant',42000,'Plein Hyundai i20','orange_money','44444444-4444-4444-8444-444444444404','2026-11-03'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc09','entretien',60000,'Pneus Yamaha','wave','44444444-4444-4444-8444-444444444405','2026-11-10'),
('cccccccc-cccc-4ccc-8ccc-cccccccccc10','autres',15000,'Frais timbre bordereaux','especes',NULL,'2026-11-12')
ON CONFLICT (id) DO NOTHING;
