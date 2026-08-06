#project 2 devops  React + Django — CI/CD Jenkins & Docker sur AWS EC2

Projet correspondant au schéma : Developer's Machine → Jenkins CI Server → Docker Hub → App EC2 Server.

## Structure
```
.
├── backend/          # API Django REST (formulaire de contact)
│   ├── core/
│   ├── formapp/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── requirements.txt
├── frontend/         # App React (formulaire)
│   ├── public/
│   └── src/
├── nginx/            # Build du front + reverse proxy vers Django
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── Jenkinsfile
└── .env.example
```

## Lancer en local
```bash
cp .env.example .env
docker compose up --build
```
- App : http://localhost
- API : http://localhost/api/contacts/
- Admin Django : http://localhost/admin/ (créer un superuser : `docker compose exec backend python manage.py createsuperuser`)

## Pipeline Jenkins (résumé)
1. **Webhook** : un `git push` sur le repo déclenche Jenkins automatiquement (`githubPush()`).
2. **Build** : Jenkins build 2 images Docker : `formapp-backend` (Django) et `formapp-nginx` (React buildé + Nginx).
3. **Push** : les images sont poussées sur Docker Hub.
4. **Deploy** : Jenkins se connecte en SSH à l'instance EC2, exécute `docker compose pull && docker compose up -d`.

## Pré-requis Jenkins
- Plugin **Docker Pipeline**, **SSH Agent**, **GitHub Integration**.
- Credentials Jenkins :
  - `dockerhub-credentials` (username/password Docker Hub)
  - `ec2-ssh-key` (clé privée SSH de l'instance EC2)
- Adapter dans `Jenkinsfile` : `DOCKERHUB_USER` et `EC2_HOST`.

## Sur l'instance EC2 (préparation, une seule fois)
```bash
sudo yum install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
# installer docker compose plugin (docker-compose-plugin) selon l'OS
mkdir -p /home/ec2-user/app
# copier docker-compose.yml (et .env) dans /home/ec2-user/app
```
Ouvrir le port **80** (et 22 pour SSH) dans le security group EC2.

## Sécurité / à adapter avant la prod
- Changer `DJANGO_SECRET_KEY`.
- Restreindre `CORS_ALLOW_ALL_ORIGINS` et `DJANGO_ALLOWED_HOSTS` au domaine réel.
- Passer sur une vraie base de données (Postgres) si besoin de robustesse/scalabilité.
- Ajouter HTTPS (Let's Encrypt / certbot ou un ALB devant EC2).
