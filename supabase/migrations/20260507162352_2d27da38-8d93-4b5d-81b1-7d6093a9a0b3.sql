UPDATE auth.users
SET encrypted_password = crypt('Youssef#Mohamed#Bakr#21#', gen_salt('bf')),
    updated_at = now()
WHERE email = 'youssf582022@gmail.com';