from rest_framework import viewsets
from .models import Contact
from .serializers import ContactSerializer


class ContactViewSet(viewsets.ModelViewSet):
    """
    CRUD simple pour le formulaire de contact.
    GET /api/contacts/    -> liste
    POST /api/contacts/   -> creation (utilise par le formulaire React)
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
