<?php
namespace SlimSEO\MetaTags\AdminColumns;

use SlimSEO\MetaTags\Helper;

class Post extends Base {
	protected $object_type;

	public function setup() {
		$types = $this->settings->get_types();
		$this->object_type = 'post';
		foreach ( $types as $type ) {
			add_filter( "manage_{$type}_posts_columns", [ $this, 'columns' ] );
			add_action( "manage_{$type}_posts_custom_column", [ $this, 'render' ], 10, 2 );
		}
		add_action( 'quick_edit_custom_box', [ $this, 'edit_fields' ], 10, 2 );
		add_action( 'bulk_edit_custom_box', [ $this, 'edit_fields' ], 10, 2 );

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ] );
		add_action( 'wp_ajax_ss_quick_edit', [ $this, 'get_quick_edit_data' ] );
		add_action( 'wp_ajax_ss_save_bulk', [ $this, 'save_bulk_edit' ] );
	}

	public function render( $column, $post_id ) {
		$data = get_post_meta( $post_id, 'slim_seo', true );
		switch ( $column ) {
			case 'meta_title':
				$title = $this->title->get_singular_value( $post_id );
				echo esc_html( Helper::normalize( $title ) );
				break;
			case 'meta_description':
				if ( ! empty( $data['description'] ) ) {
					echo esc_html( Helper::normalize( $data['description'] ) );
				}
				break;
			case 'noindex':
				echo ( ! empty( $data['noindex'] ) && $data['noindex'] == true ) ? '<span class="dashicons dashicons-saved green"></span>' : '<span class="dashicons dashicons-no-alt"></span>';
				break;
		}
	}
	public function edit_fields( $column_name, $post_type  ) {
		if ( 'meta_title' === $column_name) {
			wp_nonce_field( 'save', 'ss_nonce' );
			?>
			<p class="wp-clearfix"></p>
			<fieldset class="inline-edit-col-left">
				<legend class="inline-edit-legend">SEO</legend>
				<div class="inline-edit-col">
						<label>
							<span class="title">Meta title</span>
							<span class="input-text-wrap">
								<input type="text" name="slim_seo[title]" value="">
							</span>
						</label>
						<label>
							<span class="title">Meta desc.</span>
							<span class="input-text-wrap">
								<textarea name="slim_seo[description]" value=""></textarea>
							</span>
						</label>
						<div class="inline-edit-group wp-clearfix">
							<label class="alignleft">
								<input type="checkbox" name="slim_seo[noindex]" value="1">
								<span class="checkbox-title">Do not display this page in search engine results / XML - HTML sitemaps (noindex)</span>
							</label>
						</div>
				</div>
			</fieldset>
			<?php
		}
	}
	public function enqueue( ) {
		wp_enqueue_style( 'slim-seo-settings', SLIM_SEO_URL . 'css/edit.css', [], SLIM_SEO_VER );
		wp_enqueue_script( 'slim-seo-populate', SLIM_SEO_URL . 'js/bulk.js', [], SLIM_SEO_VER, true );
	}
	public function save_bulk_edit() {
	    if ( ! wp_verify_nonce( $_POST['nonce'], 'save' ) || empty( $_POST[ 'post_ids' ] ) ) {
			die();
		}

		$data = isset( $_POST['slim_seo'] ) ? wp_unslash( $_POST['slim_seo'][0] ) : [];
		$data = $this->sanitize( $data );

		if ( empty( $data ) ) {
			return;
		}
		foreach( $_POST[ 'post_ids' ] as $post_id ) {
			update_metadata( $this->object_type, $post_id, 'slim_seo', $data );
		}
	}
	public function get_quick_edit_data() {
		if ( empty( $_POST[ 'post_id' ] ) ) {
			wp_send_json_error( __( 'No post selected', 'slim-seo' ), 400 );
		}
		$data = get_metadata( $this->object_type, $_POST[ 'post_id' ], 'slim_seo', true );

		wp_send_json_success( [
			'message'  => 'success',
			'slim_seo' => $data,
		] );
		die;
	}
	private function sanitize( $data ) {
		$data = array_merge( $this->defaults, $data );

		$data['title']       = sanitize_text_field( $data['title'] );
		$data['description'] = sanitize_text_field( $data['description'] );
		$data['noindex']     = $data['noindex'] ? 1 : 0;

		return array_filter( $data );
	}
}
