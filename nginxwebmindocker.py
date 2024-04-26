
import os

def install_nginx_webmin_docker():
    
    os.system('sudo apt update')

    os.system('sudo apt install nginx -y')

    os.system('sudo sh -c \'echo "deb https://download.webmin.com/download/repository sarge contrib" > /etc/apt/sources.list.d/webmin.list\'')
    os.system('wget -q -O- http://www.webmin.com/jcameron-key.asc | sudo apt-key add -')
    os.system('sudo apt update')
    os.system('sudo apt install webmin -y')


    os.system('sudo apt install docker.io -y')

    os.system('sudo usermod -aG docker $USER')

    os.system('sudo systemctl restart docker')

    
    with open('/etc/nginx/sites-available/default', 'w') as nginx_conf:
        nginx_conf.write('''
server {
    listen 8080;

    server_name localhost;

    location /nginx/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webmin/ {
        proxy_pass http://localhost:10000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
''')

    
    os.system('sudo nginx -t')
    
    os.system('sudo systemctl restart nginx')

    print("Instalação completa. Nginx, Webmin e Docker estão instalados e configurados.")

if __name__ == "__main__":
    install_nginx_webmin_docker()
