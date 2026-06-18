'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSite } from '@/actions/updateSite';
import { makeSiteId } from '@/lib/siteUtils';
import type { Site } from '@/types/site';
import { useAppDialog } from './AppDialog';

type EditSiteFormProps = {
  site: Site;
};

export default function EditSiteForm({ site }: EditSiteFormProps) {
  const router = useRouter();
  const { dialogElement, showAlert } = useAppDialog();
  const primaryContact = site.contacts?.[0] ?? {};

  const initialFormData = useMemo(() => ({
    name: site.name || '',
    aliases: (site.aliases ?? []).filter(alias => alias !== site.name).join(', '),
    addressLine1: site.address?.line1 || '',
    addressLine2: site.address?.line2 || '',
    city: site.address?.city || '',
    region: site.address?.region || '',
    postalCode: site.address?.postalCode || '',
    country: site.address?.country || '',
    contactName: primaryContact.name || '',
    contactRole: primaryContact.role || '',
    contactEmail: primaryContact.email || '',
    contactPhone: primaryContact.phone || '',
    notes: site.notes || '',
  }), [primaryContact.email, primaryContact.name, primaryContact.phone, primaryContact.role, site]);

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const siteId = makeSiteId(formData.name);

  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const aliases = formData.aliases
        .split(',')
        .map(alias => alias.trim())
        .filter(Boolean);

      const contact = {
        name: formData.contactName.trim(),
        role: formData.contactRole.trim(),
        email: formData.contactEmail.trim(),
        phone: formData.contactPhone.trim(),
      };

      const hasContact = Object.values(contact).some(Boolean);
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
        contacts: hasContact ? [contact] : [],
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

        <h2 className="h5 mt-4">Primary Contact</h2>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label htmlFor="contactName" className="form-label">Name</label>
            <input id="contactName" name="contactName" className="form-control" value={formData.contactName} onChange={onChange} />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="contactRole" className="form-label">Role</label>
            <input id="contactRole" name="contactRole" className="form-control" value={formData.contactRole} onChange={onChange} />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="contactEmail" className="form-label">Email</label>
            <input id="contactEmail" name="contactEmail" type="email" className="form-control" value={formData.contactEmail} onChange={onChange} />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="contactPhone" className="form-label">Phone</label>
            <input id="contactPhone" name="contactPhone" className="form-control" value={formData.contactPhone} onChange={onChange} />
          </div>
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea id="notes" name="notes" className="form-control" value={formData.notes} onChange={onChange} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving || !siteId}>
          <i className="bi bi-floppy me-2"></i>
          {saving ? 'Saving...' : 'Save Site'}
        </button>
      </form>
    </div>
  );
}
