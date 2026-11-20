'use client';

import { useActionState } from 'react';
import { savePortfolio, type PortfolioFormState } from '../../actions';
import type { PortfolioItem } from '@/lib/data';
import { services } from '@/lib/services';

type Props = { item?: PortfolioItem; defaultService?: string };

export default function PortfolioForm({ item, defaultService = '' }: Props) {
  const [state, action, pending] = useActionState<PortfolioFormState, FormData>(savePortfolio, { error: '', fields: {} });
  const invalid = (name: keyof PortfolioFormState['fields']) => (state.fields[name] ? true : undefined);
  const note = (name: keyof PortfolioFormState['fields']) =>
    state.fields[name] ? <p className="field-error" id={`${name}Error`}>{state.fields[name]}</p> : null;

  return (
    <form action={action} className="admin-form portfolio-form">
      {item && <input type="hidden" name="id" value={item.id} />}
      {state.error && <p className="admin-flash is-error field-wide" role="alert">{state.error}</p>}

      <div className="field">
        <label htmlFor="title">Project title *</label>
        <input id="title" name="title" maxLength={120} required defaultValue={item?.title} aria-invalid={invalid('title')} aria-describedby={state.fields.title ? 'titleError' : undefined} />
        {note('title')}
      </div>
      <div className="field">
        <label htmlFor="service_slug">Service page *</label>
        <select id="service_slug" name="service_slug" required defaultValue={item?.service_slug ?? defaultService} aria-invalid={invalid('service_slug')} aria-describedby={state.fields.service_slug ? 'service_slugError' : undefined}>
          <option value="">Choose a service</option>
          {services.map(service => <option key={service.slug} value={service.slug}>{service.name}</option>)}
        </select>
        {note('service_slug')}
      </div>
      <div className="field">
        <label htmlFor="client">Client <span className="optional">(optional)</span></label>
        <input id="client" name="client" maxLength={120} defaultValue={item?.client ?? ''} />
      </div>
      <div className="field">
        <label htmlFor="site_url">Website address <span className="optional">(optional)</span></label>
        <input id="site_url" name="site_url" type="url" placeholder="https://" maxLength={500} defaultValue={item?.site_url ?? ''} aria-invalid={invalid('site_url')} aria-describedby={state.fields.site_url ? 'site_urlError' : undefined} />
        {note('site_url')}
      </div>
      <div className="field field-wide">
        <label htmlFor="image_url">Screenshot image address <span className="optional">(optional)</span></label>
        <input id="image_url" name="image_url" type="text" inputMode="url" placeholder="https://…/screenshot.jpg" maxLength={500} defaultValue={item?.image_url ?? ''} aria-invalid={invalid('image_url')} aria-describedby={['imageHint', state.fields.image_url ? 'image_urlError' : ''].filter(Boolean).join(' ')} />
        <p className="field-hint" id="imageHint">A landscape screenshot works best (about 16:10). Use a full https:// address or a site path such as /assets/portfolio/samples/shop.png. Leave empty to show the Squaberry mark instead.</p>
        {note('image_url')}
      </div>
      <div className="field field-wide">
        <label htmlFor="summary">Short summary <span className="optional">(optional)</span></label>
        <textarea id="summary" name="summary" rows={3} maxLength={400} defaultValue={item?.summary ?? ''} aria-describedby="summaryHint" />
        <p className="field-hint" id="summaryHint">One or two sentences about what you built. Up to 400 characters.</p>
      </div>
      <div className="field">
        <label htmlFor="sort_order">Display order</label>
        <input id="sort_order" name="sort_order" type="number" step={1} defaultValue={item?.sort_order ?? 0} aria-describedby="orderHint" />
        <p className="field-hint" id="orderHint">Lower numbers show first.</p>
      </div>
      <div className="field checkbox-field">
        <input id="published" name="published" type="checkbox" defaultChecked={item ? item.published : true} />
        <label htmlFor="published">Show on the service page</label>
      </div>

      <div className="form-footer field-wide">
        <button className="button" type="submit" disabled={pending}>
          {pending ? 'Saving…' : item ? 'Save changes' : 'Add project'} <span className="arrow" aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}
