import { RawHTML } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import FacebookImage from "./FacebookImage";
import HomepageDescription from "./HomepageDescription";
import HomepageTitle from "./HomepageTitle";
import TwitterImage from "./TwitterImage";

const StaticPage = () => (
	<>
		<h3>{ __( 'Homepage', 'slim-seo' ) }</h3>
		<RawHTML>
			{ sprintf(
				__( '<p>You have a page <a href="%s">%s</a> that is set as the homepage.</p><p>To set the meta tags for the page, please <a href="%s">set on the edit page</a>.</p>', 'slim-seo' ),
				ss.homepage.link,
				ss.homepage.name,
				ss.homepage.edit
			) }
		</RawHTML>
	</>
);

const ArchivePage = ( { option } ) => {
	const baseName = 'slim_seo[home]';

	return <>
		<h3>{ __( 'Homepage', 'slim-seo' ) }</h3>
		<HomepageTitle
			id={ `${ baseName }[title]` }
			std={ option.title || '' }
			placeholder={ ss.homepage.title }
		/>
		<HomepageDescription
			id={ `${ baseName }[description]` }
			std={ option.description || '' }
			placeholder={ ss.homepage.description }
		/>
		<FacebookImage
			id={ `${ baseName }[facebook_image]` }
			std={ option.facebook_image || '' }
		/>
		<TwitterImage
			id={ `${ baseName }[twitter_image]` }
			std={ option.twitter_image || '' }
		/>
	</>;
};

export default ( { option } ) => ss.hasHomepageSettings ? <ArchivePage option={ option } /> : <StaticPage />;