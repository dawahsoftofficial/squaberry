'use client';

import { useState } from 'react';
import ProjectCard from './ProjectCard';
import type { CardProject } from '@/lib/case-study';

type Filter = { value: string; label: string; count: number };
type Props = { filters: Filter[]; projects: CardProject[] };

// Card widths repeat in this rhythm so rows always fill the 12-column grid.
const pattern = ['span-7', 'span-5', 'span-4', 'span-4', 'span-4', 'span-5', 'span-7'];

/** Filter chips (with counts) above the project grid, like the reference's Our Work page. */
export default function ProjectsBrowser({ filters, projects }: Props) {
  const [active, setActive] = useState('all');
  const visible = projects.filter(project => active === 'all' || project.service_slug === active);
  const spanFor = (index: number) => {
    if (visible.length === 1) return 'span-12';
    // Avoid a lone half-row at the end: stretch the last card when the rhythm would leave a gap.
    const isLast = index === visible.length - 1;
    const remainder = visible.length % pattern.length;
    if (isLast && (remainder === 1 || remainder === 3 || remainder === 6)) return 'span-12';
    if (isLast && remainder === 4) return 'span-8';
    return pattern[index % pattern.length];
  };

  return (
    <>
      <div className="filter-chips" role="group" aria-label="Filter projects by service">
        <button type="button" className="filter-chip" aria-pressed={active === 'all'} onClick={() => setActive('all')}>
          All<sup>{projects.length}</sup>
        </button>
        {filters.map(filter => (
          <button key={filter.value} type="button" className="filter-chip" aria-pressed={active === filter.value} onClick={() => setActive(filter.value)}>
            {filter.label}<sup>{filter.count}</sup>
          </button>
        ))}
      </div>
      <p className="work-count muted" role="status" aria-live="polite">Showing {visible.length} of {projects.length} projects</p>
      <div className="bento work-grid">
        {visible.map((project, index) => (
          <ProjectCard key={project.id} project={project} className={spanFor(index)} priority={index < 2} />
        ))}
      </div>
    </>
  );
}
