import { Gallery } from "@/components/site/Gallery";
import { Ministries } from "@/components/site/Ministries";
import { Profile } from "@/components/site/Profile";
import { Videos } from "@/components/site/Videos";
import { ContactPanel } from "@/components/ui/ContactPanel";
import { privateContact } from "@/lib/content/private";
import { useContent } from "@/lib/cms/context";

export function Story() {
  const { profile } = useContent();
  return (
    <main id="content">
      <section id="word" className="sheet sheet-hero">
        <Profile
          name={profile.name}
          descriptor={profile.descriptor}
          church={profile.church}
          location={profile.location}
          biography={profile.biography}
        />
      </section>

      <section id="ministry" className="stage">
        <Ministries focus={profile.ministryFocus} works={profile.works} />
      </section>

      <section id="videos" className="stage">
        <Videos />
      </section>

      <section id="gallery" className="stage">
        <Gallery />
      </section>

      <section id="contact" className="sheet">
        <div className="sheet-inner">
          <h2>Ministry Invitations</h2>
          <p>{profile.invitations.intro}</p>
          <ContactPanel />
          <h2>Contact &amp; Social Media</h2>
          <dl className="directory">
            <div>
              <dt>Phone / WhatsApp</dt>
              <dd>
                <a href={privateContact.whatsappUrl}>{privateContact.phoneIntl}</a> (Ghana)
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${privateContact.email}`}>{privateContact.email}</a>
              </dd>
            </div>
            <div>
              <dt>Facebook profile</dt>
              <dd>
                <a href={profile.social.facebookProfile} target="_blank" rel="noopener noreferrer">
                  Open Facebook profile
                </a>
              </dd>
            </div>
            <div>
              <dt>Facebook share link</dt>
              <dd>
                <a href={profile.social.facebookShare} target="_blank" rel="noopener noreferrer">
                  Open Facebook link
                </a>
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer">
                  {profile.social.instagramHandle}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="site-footer">
        <p>
          {profile.church}
          <span>Oyarifa – Accra, Ghana</span>
        </p>
        <button type="button" id="classic-toggle">
          Classic view
        </button>
      </footer>
    </main>
  );
}
