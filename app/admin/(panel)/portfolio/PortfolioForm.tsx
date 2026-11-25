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
        <p className="field-hint" id="imageHint">A landscape screenshot works best (about 16:10). Use a full https:// address or a site path such as /assets/portfolio/shop.png. It is the card image and the large picture at the top of the project page.</p>
        {note('image_url')}
      </div>
      <div className="field field-wide">
        <label htmlFor="summary">Short summary <span className="optional">(optional)</span></label>
        <textarea id="summary" name="summary" rows={3} maxLength={400} defaultValue={item?.summary ?? ''} aria-describedby="summaryHint" />
        <p className="field-hint" id="summaryHint">One or two sentences about what you built. Up to 400 characters.</p>
      </div>
      <fieldset className="field-wide case-fields">
        <legend>Project page</legend>
        <p className="field-hint">These fill the project’s own page. Leave any of them empty to skip that part of the page. In longer boxes, leave a blank line between paragraphs.</p>
        <div className="field">
          <label htmlFor="slug">Page address <span className="optional">(optional)</span></label>
          <input id="slug" name="slug" maxLength={140} defaultValue={item?.slug ?? ''} placeholder="made from the title" aria-invalid={invalid('slug')} aria-describedby={['slugHint', state.fields.slug ? 'slugError' : ''].filter(Boolean).join(' ')} />
          <p className="field-hint" id="slugHint">The page lives at /work/<em>address</em>. Letters, numbers and hyphens.</p>
          {note('slug')}
        </div>
        <div className="field">
          <label htmlFor="scope">What we did <span className="optional">(optional)</span></label>
          <textarea id="scope" name="scope" rows={4} maxLength={600} defaultValue={item?.scope ?? ''} aria-describedby="scopeHint" />
          <p className="field-hint" id="scopeHint">One item per line, for example “Web design”.</p>
        </div>
        <div className="field field-wide">
          <label htmlFor="intro">Introduction <span className="optional">(optional)</span></label>
          <textarea id="intro" name="intro" rows={3} maxLength={600} defaultValue={item?.intro ?? ''} aria-describedby="introHint" />
          <p className="field-hint" id="introHint">Shown beside the page heading (the short summary above is the heading).</p>
        </div>
        <div className="field field-wide">
          <label htmlFor="overview">Overview <span className="optional">(optional)</span></label>
          <textarea id="overview" name="overview" rows={5} maxLength={8000} defaultValue={item?.overview ?? ''} />
        </div>
        <div className="field field-wide">
          <label htmlFor="challenge">The challenge <span className="optional">(optional)</span></label>
          <textarea id="challenge" name="challenge" rows={5} maxLength={8000} defaultValue={item?.challenge ?? ''} />
        </div>
        <div className="field field-wide">
          <label htmlFor="solution">What we built <span className="optional">(optional)</span></label>
          <textarea id="solution" name="solution" rows={5} maxLength={8000} defaultValue={item?.solution ?? ''} />
        </div>
        <div className="field field-wide">
          <label htmlFor="results">The outcome <span className="optional">(optional)</span></label>
          <textarea id="results" name="results" rows={5} maxLength={8000} defaultValue={item?.results ?? ''} />
        </div>
        <div className="field field-wide">
          <label htmlFor="gallery">Gallery images <span className="optional">(optional)</span></label>
          <textarea id="gallery" name="gallery" rows={4} maxLength={6000} defaultValue={item?.gallery ?? ''} placeholder="/assets/work/project-1.jpg | Homepage on desktop and phone" aria-invalid={invalid('gallery')} aria-describedby={['galleryHint', state.fields.gallery ? 'galleryError' : ''].filter(Boolean).join(' ')} />
          <p className="field-hint" id="galleryHint">One image per line: the address, then “|” and a short description. The first image shows full width; the next two share a row (a tall image, then a wide one).</p>
          {note('gallery')}
        </div>
        <div className="field field-wide">
          <label htmlFor="quote">Client quote <span className="optional">(optional)</span></label>
          <textarea id="quote" name="quote" rows={3} maxLength={2000} defaultValue={item?.quote ?? ''} aria-describedby="quoteHint" />
          <p className="field-hint" id="quoteHint">Only add a quote the client has agreed to share.</p>
        </div>
        <div className="field">
          <label htmlFor="quote_name">Quote by <span className="optional">(optional)</span></label>
          <input id="quote_name" name="quote_name" maxLength={120} defaultValue={item?.quote_name ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="quote_role">Their role <span className="optional">(optional)</span></label>
          <input id="quote_role" name="quote_role" maxLength={120} defaultValue={item?.quote_role ?? ''} />
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="sort_order">Display order</label>
        <input id="sort_order" name="sort_order" type="number" step={1} defaultValue={item?.sort_order ?? 0} aria-describedby="orderHint" />
        <p className="field-hint" id="orderHint">Lower numbers show first.</p>
      </div>
      <div className="field checkbox-field">
        <input id="published" name="published" type="checkbox" defaultChecked={item ? item.published : true} />
        <label htmlFor="published">Show on the site</label>
      </div>

      <div className="form-footer field-wide">
        <button className="button" type="submit" disabled={pending}>
          {pending ? 'Saving…' : item ? 'Save changes' : 'Add project'} <span className="arrow" aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}
