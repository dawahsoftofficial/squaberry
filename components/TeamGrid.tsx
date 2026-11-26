import Image from 'next/image';
import Icon from './Icon';
import type { TeamGroup } from '@/lib/team';

/** One team group: a small heading row, then a card per member (photo or placeholder, name, role, bio). */
export default function TeamGrid({ group }: { group: TeamGroup }) {
  const headingId = `team-${group.id}`;
  return (
    <div className="team-group" role="group" aria-labelledby={headingId}>
      <div className="team-group-head reveal">
        <h3 id={headingId}>{group.title}</h3>
        <p>{group.intro}</p>
      </div>
      <ul className="team-grid">
        {group.members.map((member, index) => (
          <li className="team-card reveal" key={`${member.role}-${index}`} style={{ ['--accent' as string]: member.accent }}>
            <div className="team-photo">
              {member.image ? (
                <Image src={member.image} alt={`${member.name}, ${member.role}`} fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 400px" />
              ) : (
                <span className="team-placeholder" aria-hidden="true">
                  <Icon name="person" size={56} />
                  <span>Photo coming soon</span>
                </span>
              )}
            </div>
            <div className="team-info">
              <h4>{member.name}</h4>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
