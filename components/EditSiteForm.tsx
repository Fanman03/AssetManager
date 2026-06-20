'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSite } from '@/actions/updateSite';
import { makeSiteId } from '@/lib/siteUtils';
import type { Site, SiteContact } from '@/types/site';
import { useAppDialog } from './AppDialog';

type EditSiteFormProps = {
  site: Site;
};

type ContactFormData = Required<SiteContact>;

const blankContact = (): ContactFormData => ({
  name: '',
  role: '',
  email: '',
  phone: '',
});

const normalizeContact = (contact: SiteContact): ContactFormData => ({
  name: contact.name || '',
  role: contact.role || '',
  email: contact.email || '',
  phone: contact.phone || '',
});

export default function EditSiteForm({ site }: EditSiteFormProps) {
  const router = useRouter();
  const { dialogElement, showAlert } = useAppDialog();

  const initialFormData = useMemo(() => ({
    name: site.name || '',
    aliases: (site.aliases ?? []).filter(alias => alias !== site.name).join(', '),
    addressLine1: site.address?.line1 || '',
    addressLine2: site.address?.line2 || '',
    city: site.address?.city || '',
    region: site.address?.region || '',
    postalCode: site.address?.postalCode || '',
    country: site.address?.country || '',
    notes: site.notes || '',
  }), [site]);

  const initialContacts = useMemo(
    () => (site.contacts?.length ? site.contacts.map(normalizeContact) : [blankContact()]),
    [site.contacts]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [contacts, setContacts] = useState<ContactFormData[]>(initialContacts);
  const [saving, setSaving] = useState(false);
  const siteId = makeSiteId(formData.name);

  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function onContactChange(index: number, field: keyof ContactFormData, value: string) {
    setContacts(prev => prev.map((contact, contactIndex) => (
      contactIndex === index ? { ...contact, [field]: value } : contact
    )));
  }

  function addContact() {
    setContacts(prev => [...prev, blankContact()]);
  }

  function removeContact(index: number) {
    setContacts(prev => {
      const next = prev.filter((_, contactIndex) => contactIndex !== index);
      return next.length ? next : [blankContact()];
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const aliases = formData.aliases
        .split(',')
        .map(alias => alias.trim())
        .filter(Boolean);

      const savedContacts = contacts
        .map(contact => ({
          name: contact.name.trim(),
          role: contact.role.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
        }))
        .filter(contact => Object.values(contact).some(Boolean));

      const saved = await updateSite(site._id, {
        name: formData.name,
        aliases,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          region: formData.region,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        contacts: savedContacts,
        notes: formData.notes,
      });

      router.push(`/site/${saved._id}`);
    } catch (error) {
      await showAlert({
        title: 'Save Failed',
        message: (error as Error).message,
        variant: 'danger',
      });
      setSaving(false);
    }
  }

  return (
    <div className="container mt-4">
      {dialogElement}
      <h1 className="display-6 fw-normal">Edit Site</h1>
      <form className="asset-form mt-4" onSubmit={onSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Site Name</label>
          <input id="name" name="name" className="form-control" value={formData.name} onChange={onChange} required />
          <div className="form-text">ID: {siteId || 'enter a site name'}</div>
        </div>

        <div className="mb-3">
          <label htmlFor="aliases" className="form-label">Aliases</label>
          <input id="aliases" name="aliases" className="form-control" value={formData.aliases} onChange={onChange} placeholder="Comma-separated alternate site names" />
        </div>

        <h2 className="h5 mt-4">Address</h2>
        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="addressLine1" className="form-label">Address Line 1</label>
            <input id="addressLine1" name="addressLine1" className="form-control" value={formData.addressLine1} onChange={onChange} />
          </div>
          <div className="col-12">
            <label htmlFor="addressLine2" className="form-label">Address Line 2</label>
            <input id="addressLine2" name="addressLine2" className="form-control" value={formData.addressLine2} onChange={onChange} />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="city" className="form-label">City</label>
            <input id="city" name="city" className="form-control" value={formData.city} onChange={onChange} />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="region" className="form-label">State / Region</label>
            <input id="region" name="region" className="form-control" value={formData.region} onChange={onChange} />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="postalCode" className="form-label">Postal Code</label>
            <input id="postalCode" name="postalCode" className="form-control" value={formData.postalCode} onChange={onChange} />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="country" className="form-label">Country</label>
            <input id="country" name="country" className="form-control" value={formData.country} onChange={onChange} />
          </div>
        </div>

        <h2 className="h5 mt-4">Notes</h2>
        <div className="mb-3 mt-3">
          <label htmlFor="notes" className="form-label">Note text</label>
          <textarea id="notes" name="notes" className="form-control" value={formData.notes} onChange={onChange} />
        </div>

        <div className="d-flex align-items-center justify-content-between gap-3 mt-4">
          <h2 className="h5 mb-0">Contact{contacts.length === 1 ? '' : 's'}</h2>
          <button className="btn btn-secondary btn-sm" type="button" onClick={addContact}>
            <i className="bi bi-plus-lg me-2"></i>
            Add Contact
          </button>
        </div>

        {contacts.map((contact, index) => (
          <div className="row g-3 mt-1 pt-3 border-top" key={index}>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <h3 className="h6 mb-0">Contact {index + 1}</h3>
              {contacts.length > 1 && (
                <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => removeContact(index)}>
                  <i className="bi bi-trash me-2"></i>
                  Remove
                </button>
              )}
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor={`contact-${index}-name`} className="form-label">Name</label>
              <input
                id={`contact-${index}-name`}
                className="form-control"
                value={contact.name}
                onChange={(event) => onContactChange(index, 'name', event.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor={`contact-${index}-role`} className="form-label">Role</label>
              <input
                id={`contact-${index}-role`}
                className="form-control"
                value={contact.role}
                onChange={(event) => onContactChange(index, 'role', event.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor={`contact-${index}-email`} className="form-label">Email</label>
              <input
                id={`contact-${index}-email`}
                type="email"
                className="form-control"
                value={contact.email}
                onChange={(event) => onContactChange(index, 'email', event.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor={`contact-${index}-phone`} className="form-label">Phone</label>
              <input
                id={`contact-${index}-phone`}
                className="form-control"
                value={contact.phone}
                onChange={(event) => onContactChange(index, 'phone', event.target.value)}
              />
            </div>
          </div>
        ))}

        <div className="mt-4 mb-4">
          <button className="btn btn-primary" type="submit" disabled={saving || !siteId}>
            <i className="bi bi-floppy me-2"></i>
            {saving ? 'Saving...' : 'Save Site'}
          </button>
        </div>
      </form>
    </div>
  );
}
