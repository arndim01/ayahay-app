INSERT INTO ayahay.port
    ("name", "code")
    VALUES
--     ('Bacolod'),
--     ('Batangas'),
--     ('Bato'),
--     ('Baybay'),
    ('Bogo', 'BOGO'),
--     ('Butuan'),
--     ('Cagayan de Oro'),
--     ('Calapan'),
--     ('Calbayog City'),
--     ('Camotes'),
--     ('Cataingan'),
--     ('Caticlan'),
--     ('Cebu'),
--     ('Consuelo'),
--     ('Danao'),
--     ('Dapa'),
--     ('Dapdap'),
--     ('Dapitan'),
--     ('Dipolog'),
--     ('Dumaguete'),
--     ('EB MagaIona'),
--     ('Escalante'),
--     ('Estancia'),
--     ('Getafe'),
--     ('Guimaras'),
--     ('Hagnaya'),
--     ('Iligan'),
--     ('Iloilo'),
--     ('Isabel'),
--     ('Jagna'),
--     ('Larena'),
--     ('Liloan'),
--     ('Manila'),
--     ('Masbate'),
--     ('Matnog'),
--     ('Medellin'),
--     ('Nasipit'),
--     ('Odiongan'),
--     ('Ormoc'),
--     ('Ozamiz'),
    ('Palompon', 'PAL')
--     ('Plaridel'),
--     ('Puerto Galera'),
--     ('Puerto Princesa'),
--     ('Romblon'),
--     ('Roxas City'),
--     ('Roxas'),
--     ('San Carlos'),
--     ('Santa Fe Island'),
--     ('Sibuyan'),
--     ('Siquijor'),
--     ('Surigao'),
--     ('Tabuelan'),
--     ('Tagbilaran City'),
--     ('Talibon'),
--     ('Toledo')
--     ('Tubigon'),
--     ('Ubay'),
--     ('Zamboanqa')
;

INSERT INTO ayahay.shipping_line
    ("name", "address", fax_number, subsidiary, telephone_number)
    VALUES
    ('E.B. Aznar Shipping Corporation', 'Manoling Bldg. V. Gullas St., San Roque Cebu City', null, 'Tabuelan Sea Transport, Inc.', '266-7178'),
    ('Jomalia Shipping Corporation', 'Kimwa Compound, S. Albano St., Subangdaku, Mandaue City', '(032) 344-4251', null, '(032) 344-4251, 343-3753'),
    ('AYAHAY SHIPPING LINES', 'Mezzanine, unit 4, New Market Bldg, Kinasang-an Cebu City, Cebu City, Philippines', null, null, '(032) 517 4255')
;

INSERT INTO ayahay.cabin_type
    ("name", "description", shipping_line_id)
    VALUES
    ('Aircon', 'Aircon', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation')),
    ('Non-Aircon', 'Non-Aircon', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'))
;

INSERT INTO ayahay.vehicle_type
    ("name", "description")
    VALUES
    ('Bicycle', 'Bicycle'),
    ('Trisikad', 'Trisikad with side car'),
    ('Motorcycle', 'Motorcycle'),
    ('Tricycle', 'Tricycle'),
    ('Motorcycle Big Bike', 'Motorcycle Big Bike'),
    ('Big Bus', 'Bus with 60 pax capacity'),
    ('Mini Bus', 'Bus with 30 pax capacity'),
    ('Jeep Owner Type', 'Jeep Owner Type'),
--     ('Sedan', 'Sedan'),
--     ('SUV', 'SUV'),
--     ('Multicab', 'Multicab'),
--     ('Pickup', 'Pickup'),
    ('4-Wheeler Automobile/Multicab/Pickup', '4-Wheeler Automobile/Multicab/Pickup'),
    ('4-Wheeler Van', '4-Wheeler Van'),
    ('4-Wheeler Light Van Canter/Elf', '4-Wheeler Light Van Canter/Elf'),
    ('4-Wheeler Light Van Canter/Elf Loaded', '4-Wheeler Light Van Canter/Elf Loaded'),
    ('6-Wheeler Light Van Canter/Elf', '6-Wheeler Light Van Canter/Elf'),
    ('6-Wheeler Light Van Canter/Elf Loaded', '6-Wheeler Light Van Canter/Elf Loaded'),
    ('6-Wheeler Light Van Forward/Fighter', '6-Wheeler Light Van Forward/Fighter'),
    ('6-Wheeler Light Van Forward/Fighter Loaded', '6-Wheeler Light Van Forward/Fighter Loaded'),
    ('6-Wheeler Big Van', '6-Wheeler Big Van'),
    ('6-Wheeler Big Van Loaded', '6-Wheeler Big Van Loaded'),
--     ('6-Wheeler Chassis', '6-Wheeler Chassis'),
    ('6-Wheeler Dump Truck', '6-Wheeler Dump Truck'),
    ('6-Wheeler Dump Truck Loaded', '6-Wheeler Dump Truck Loaded'),
    ('6-Wheeler Forward/Fighter Extended', '6-Wheeler Forward/Fighter Extended'),
    ('6-Wheeler Forward/Fighter Extended Loaded', '6-Wheeler Forward/Fighter Extended Loaded'),
--     ('8-Wheeler Oil Tanker', '8-Wheeler Oil Tanker'),
--     ('8-Wheeler Chassis', '8-Wheeler Chassis'),
--     ('10-Wheeler Chassis', '10-Wheeler Chassis')
    ('Forklift 5 tons down', 'Forklift 5 tons down'),
    ('Forklift 5-20 tons', 'Forklift 5-20 tons'),
    ('Forklift 20 tons', 'Forklift 20 tons'),
    ('Mixer Truck Small', 'Mixer Truck Small'),
    ('Mixer Truck Medium', 'Mixer Truck Medium'),
    ('Mixer Truck Large', 'Mixer Truck Large'),
    ('Road Roller 5 tons down', 'Road Roller 5 tons down'),
    ('Road Roller 5-20 tons', 'Road Roller 5-20 tons'),
    ('Road Roller 20 tons up', 'Road Roller 20 tons up'),
    ('Farm Tractor 5 tons down', 'Farm Tractor 5 tons down'),
    ('Farm Tractor 5 tons up', 'Farm Tractor 5 tons up'),
    ('Bulldozer Small', 'Bulldozer Small'),
    ('Bulldozer Medium', 'Bulldozer Medium'),
    ('Bulldozer Large', 'Bulldozer Large'),
    ('Grader Small', 'Grader Small'),
    ('Grader Medium', 'Grader Medium'),
    ('Grader Large', 'Grader Large'),
    ('Payloader Small', 'Payloader Small'),
    ('Payloader Medium', 'Payloader Medium'),
    ('Payloader Large', 'Payloader Large'),
    ('Crane Small', 'Crane Small'),
    ('Crane Medium', 'Crane Medium'),
    ('Crane Large', 'Crane Large'),
    ('Excavator Small', 'Excavator Small'),
    ('Excavator Medium', 'Excavator Medium'),
    ('Excavator Large', 'Excavator Large')
;

INSERT INTO ayahay.ship
    ("name", shipping_line_id, recommended_vehicle_capacity)
    VALUES
    ('Melrivic 2', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'), 5),
    ('Melrivic 7', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'), 5)
;

INSERT INTO ayahay.seat_plan
    ("name", row_count, column_count, shipping_line_id)
    VALUES
    ('Seat Plan', 5, 6, (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'))
;

INSERT INTO ayahay.seat_type
    ("name", "description", shipping_line_id)
    VALUES
    ('Window', 'Window', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation')),
    ('Aisle', 'Aisle', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation')),
    ('Lower Bunk Bed', 'Lower Bunk Bed', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation')),
    ('Upper Bunk Bed', 'Upper Bunk Bed', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'))
;

INSERT INTO ayahay.seat
    ("name", "seat_type_id", "row", "column", seat_plan_id)
    SELECT
        CONCAT(
            -- map row to letter: 0 -> A, 1 -> B, etc.
            CHR(r + ASCII('A')),
            (c + 1)::TEXT
        ) AS "name",
        -- seats in first column are window seats, second column aisle, etc.
        (ARRAY[1, 2, 3, 4])[c + 1] AS "type",
        r AS "row",
        c AS "column",
        seat_plan.id AS seat_plan_id
    FROM ayahay.seat_plan seat_plan
    CROSS JOIN generate_series(0, 1) r
    CROSS JOIN generate_series(0, 3) c
;

INSERT INTO ayahay.cabin
    ("name", recommended_passenger_capacity, ship_id, cabin_type_id, default_seat_plan_id)
    VALUES
    ('Melrivic 2 Aircon Cabin', 10, (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 2'), (SELECT id from ayahay.cabin_type WHERE "name" = 'Aircon'), (SELECT id FROM ayahay.seat_plan WHERE "name" = 'Seat Plan')),
    ('Melrivic 2 Non-Aircon Cabin', 10, (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 2'), (SELECT id from ayahay.cabin_type WHERE "name" = 'Non-Aircon'), NULL),
    ('Melrivic 7 Non-Aircon Cabin', 10, (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 7'), (SELECT id from ayahay.cabin_type WHERE "name" = 'Non-Aircon'), NULL)
;

INSERT INTO ayahay.rate_table ("name", shipping_line_id)
    VALUES
    (
        'Bogo <-> Palompon Melrivic 2 Rate Table',
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation')
    ),
    (
        'Bogo <-> Palompon Melrivic 7 Rate Table',
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation')
    )
;

INSERT INTO ayahay.rate_table_row
    (
        rate_table_id,
        cabin_id,
        vehicle_type_id,
        fare,
        can_book_online
    )
    (
        SELECT rates.id, rate.cabin_id, rate.vehicle_type_id, rate.fare, TRUE
        FROM ayahay.rate_table rates
        LEFT JOIN (
            VALUES
                ((SELECT id FROM ayahay.cabin WHERE "name" = 'Melrivic 2 Non-Aircon Cabin'), NULL, 410),
                ((SELECT id FROM ayahay.cabin WHERE "name" = 'Melrivic 2 Aircon Cabin'), NULL, 820),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bicycle'), 130),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Trisikad'), 345),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Motorcycle'), 1150),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Tricycle'), 1440),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Motorcycle Big Bike'), 1440),

                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Big Bus'), 5250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Mini Bus'), 3965),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Jeep Owner Type'), 2490),

                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '4-Wheeler Automobile/Multicab/Pickup'), 2750),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '4-Wheeler Van'), 3320),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '4-Wheeler Light Van Canter/Elf'), 3320),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '4-Wheeler Light Van Canter/Elf Loaded'), 3780),

                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Light Van Canter/Elf'), 3450),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Light Van Canter/Elf Loaded'), 4930),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Light Van Forward/Fighter'), 4610),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Light Van Forward/Fighter Loaded'), 6310),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Big Van'), 4610),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Big Van Loaded'), 6310),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Dump Truck'), 3450),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Dump Truck Loaded'), 4930),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Forward/Fighter Extended'), 7185),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Forward/Fighter Extended Loaded'), 9070),

                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Forklift 5 tons down'), 5750),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Forklift 5-20 tons'), 8050),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Forklift 20 tons'), 10350),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Mixer Truck Small'), 11500),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Mixer Truck Medium'), 14950),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Mixer Truck Large'), 18400),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Road Roller 5 tons down'), 8050),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Road Roller 5-20 tons'), 10350),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Road Roller 20 tons up'), 13800),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Farm Tractor 5 tons down'), 4600),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Farm Tractor 5 tons up'), 6900),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bulldozer Small'), 10350),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bulldozer Medium'), 13800),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bulldozer Large'), 17250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Grader Small'), 10350),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Grader Medium'), 13800),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Grader Large'), 17250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Payloader Small'), 6900),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Payloader Medium'), 9200),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Payloader Large'), 11500),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Crane Small'), 11500),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Crane Medium'), 17250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Crane Large'), 23000),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Excavator Small'), 11500),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Excavator Medium'), 17250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Excavator Large'), 23000)
--                 (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Sedan'), 2650),
--                 (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'SUV'), 2650),
--                 (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Multicab'), 2650),
--                 (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Pickup'), 2650)
        ) AS rate(cabin_id, vehicle_type_id, fare) ON true = true
        WHERE rates.name = 'Bogo <-> Palompon Melrivic 2 Rate Table'
    )
;

INSERT INTO ayahay.rate_table_row
    (
        rate_table_id,
        cabin_id,
        vehicle_type_id,
        fare,
        can_book_online
    )
    (
        SELECT rates.id, rate.cabin_id, rate.vehicle_type_id, rate.fare, TRUE
        FROM ayahay.rate_table rates
        LEFT JOIN (
            VALUES
                ((SELECT id FROM ayahay.cabin WHERE "name" = 'Melrivic 7 Non-Aircon Cabin'), NULL, 410),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bicycle'), 130),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Trisikad'), 345),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Motorcycle'), 1150),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Tricycle'), 1440),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Motorcycle Big Bike'), 1440),

                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Big Bus'), 5250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Mini Bus'), 3965),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Jeep Owner Type'), 2490),

                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '4-Wheeler Automobile/Multicab/Pickup'), 2750),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '4-Wheeler Van'), 3320),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '4-Wheeler Light Van Canter/Elf'), 3320),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '4-Wheeler Light Van Canter/Elf Loaded'), 3780),

                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Light Van Canter/Elf'), 3450),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Light Van Canter/Elf Loaded'), 4930),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Light Van Forward/Fighter'), 4610),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Light Van Forward/Fighter Loaded'), 6310),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Big Van'), 4610),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Big Van Loaded'), 6310),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Dump Truck'), 3450),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Dump Truck Loaded'), 4930),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Forward/Fighter Extended'), 7185),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = '6-Wheeler Forward/Fighter Extended Loaded'), 9070),

                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Forklift 5 tons down'), 5750),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Forklift 5-20 tons'), 8050),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Forklift 20 tons'), 10350),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Mixer Truck Small'), 11500),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Mixer Truck Medium'), 14950),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Mixer Truck Large'), 18400),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Road Roller 5 tons down'), 8050),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Road Roller 5-20 tons'), 10350),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Road Roller 20 tons up'), 13800),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Farm Tractor 5 tons down'), 4600),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Farm Tractor 5 tons up'), 6900),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bulldozer Small'), 10350),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bulldozer Medium'), 13800),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bulldozer Large'), 17250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Grader Small'), 10350),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Grader Medium'), 13800),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Grader Large'), 17250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Payloader Small'), 6900),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Payloader Medium'), 9200),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Payloader Large'), 11500),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Crane Small'), 11500),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Crane Medium'), 17250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Crane Large'), 23000),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Excavator Small'), 11500),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Excavator Medium'), 17250),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Excavator Large'), 23000)
--                 (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Sedan'), 2650),
--                 (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'SUV'), 2650),
--                 (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Multicab'), 2650),
--                 (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Pickup'), 2650)
        ) AS rate(cabin_id, vehicle_type_id, fare) ON true = true
        WHERE rates.name = 'Bogo <-> Palompon Melrivic 7 Rate Table'
    )
;

INSERT INTO ayahay.shipping_line_schedule
    (
        "name",
        departure_hour,
        departure_minute,
        days_before_booking_start,
        days_before_booking_cut_off,
        ship_id,
        shipping_line_id,
        src_port_id,
        dest_port_id,
        rate_table_id
    )
    VALUES
    (
        'Bogo -> Palompon 11:30 AM',
        11,
        30,
        60,
        7,
        (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 2'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bogo'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Palompon'),
        (SELECT id FROM ayahay.rate_table WHERE "name" = 'Bogo <-> Palompon Melrivic 2 Rate Table')
    ),
    (
        'Bogo -> Palompon 11:00 PM',
        23,
        00,
        60,
        7,
        (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 7'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bogo'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Palompon'),
        (SELECT id FROM ayahay.rate_table WHERE "name" = 'Bogo <-> Palompon Melrivic 7 Rate Table')
    ),
    (
        'Palompon -> Bogo 3:30 PM',
        15,
        30,
        60,
        7,
        (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 2'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Palompon'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bogo'),
        (SELECT id FROM ayahay.rate_table WHERE "name" = 'Bogo <-> Palompon Melrivic 2 Rate Table')
    ),
    (
        'Palompon -> Bogo 6:30 AM',
        06,
        30,
        60,
        7,
        (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 7'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Palompon'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bogo'),
        (SELECT id FROM ayahay.rate_table WHERE "name" = 'Bogo <-> Palompon Melrivic 7 Rate Table')
    )
;

INSERT INTO ayahay.travel_agency ("name") VALUES ('Ayahay Travel Agency');

INSERT INTO ayahay.travel_agency_shipping_line (travel_agency_id, shipping_line_id) VALUES (
    (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'),
    (SELECT id FROM ayahay.travel_agency WHERE "name" = 'Ayahay Travel Agency')
);