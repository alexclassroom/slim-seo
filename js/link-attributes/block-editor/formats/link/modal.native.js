import { Platform } from 'react-native';
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { prependHTTP } from '@wordpress/url';
import { BottomSheet, withSpokenMessages } from '@wordpress/components';
import { create, insert, isCollapsed, applyFormat, getTextContent, slice } from '@wordpress/rich-text';
import { external, link, textColor } from '@wordpress/icons';
import { createLinkFormat, isValidHref } from './utils';

import styles from './modal.scss';

class ModalLinkUI extends Component {
	constructor () {
		super(...arguments)

		this.submitLink = this.submitLink.bind(this)
		this.onChangeInputValue = this.onChangeInputValue.bind(this)
		this.onChangeText = this.onChangeText.bind(this)
		this.onChangeOpensInNewWindow = this.onChangeOpensInNewWindow.bind(
			this
		)
		this.removeLink = this.removeLink.bind(this)
		this.onDismiss = this.onDismiss.bind(this)

		this.state = {
			inputValue       : '',
			text             : '',
			opensInNewWindow : false,
			nofollow         : false,
			sponsored        : false,
			title            : ''
		}
	}

	componentDidUpdate (oldProps) {
		if (oldProps === this.props) {
			return
		}

		const {
			activeAttributes: { url, target }
		} = this.props
		const opensInNewWindow = '_blank' === target

		this.setState({
			inputValue : url || '',
			text       : getTextContent(slice(this.props.value)),
			opensInNewWindow
		})
	}

	onChangeInputValue (inputValue) {
		this.setState({ inputValue })
	}

	onChangeText (text) {
		this.setState({ text })
	}

	onChangeOpensInNewWindow (opensInNewWindow) {
		this.setState({ opensInNewWindow })
	}

	submitLink () {
		const { isActive, onChange, speak, value } = this.props
		const { inputValue, opensInNewWindow, text } = this.state
		const url = prependHTTP(inputValue)
		const linkText = text || inputValue
		const format = createLinkFormat({
			url,
			opensInNewWindow,
			text : linkText
		})

		if (isCollapsed(value) && !isActive) {
			// insert link
			const toInsert = applyFormat(
				create({ text: linkText }),
				format,
				0,
				linkText.length
			)
			const newAttributes = insert(value, toInsert)
			onChange({ ...newAttributes, needsSelectionUpdate: true })
		} else if (text !== getTextContent(slice(value))) {
			// edit text in selected link
			const toInsert = applyFormat(
				create({ text }),
				format,
				0,
				text.length
			)
			const newAttributes = insert(
				value,
				toInsert,
				value.start,
				value.end
			)
			onChange({ ...newAttributes, needsSelectionUpdate: true })
		} else {
			// transform selected text into link
			const newAttributes = applyFormat(value, format)
			onChange({ ...newAttributes, needsSelectionUpdate: true })
		}

		if (!isValidHref(url)) {
			speak(
				__(
					'Warning: the link has been inserted but may have errors. Please test it.',
					'slim-seo'
				),
				'assertive'
			)
		} else if (isActive) {
			speak( __('Link edited.', 'slim-seo'), 'assertive' )
		} else {
			speak( __('Link inserted', 'slim-seo'), 'assertive' )
		}

		this.props.onClose()
	}

	removeLink () {
		this.props.onRemove()
		this.props.onClose()
	}

	onDismiss () {
		if ('' === this.state.inputValue) {
			this.removeLink()
		} else {
			this.submitLink()
		}
	}

	render () {
		const { isVisible } = this.props
		const { text } = this.state

		return (
			<BottomSheet
				isVisible={ isVisible }
				onClose={ this.onDismiss }
				hideHeader
			>
				{
					<BottomSheet.Cell
						icon={ link }
						label={ __( 'URL', 'slim-seo' ) }
						value={ this.state.inputValue }
						placeholder={ __( 'Add URL', 'slim-seo' ) }
						autoCapitalize="none"
						autoCorrect={ false }
						keyboardType="url"
						onChangeValue={ this.onChangeInputValue }
						onSubmit={ this.onDismiss }
						autoFocus={ 'ios' === Platform.OS }
					/>
				}
				<BottomSheet.Cell
					icon={ textColor }
					label={ __( 'Link text', 'slim-seo' ) }
					value={ text }
					placeholder={ __( 'Add link text', 'slim-seo' ) }
					onChangeValue={ this.onChangeText }
					onSubmit={ this.onDismiss }
				/>
				<BottomSheet.SwitchCell
					icon={ external }
					label={ __( 'Open in new tab', 'slim-seo' ) }
					value={ this.state.opensInNewWindow }
					onValueChange={ this.onChangeOpensInNewWindow }
					separatorType={ 'fullWidth' }
				/>
				<BottomSheet.Cell
					label={ __( 'Remove link', 'slim-seo' ) }
					labelStyle={ styles.clearLinkButton }
					separatorType={ 'none' }
					onPress={ this.removeLink }
				/>
			</BottomSheet>
		)
	}
}

export default withSpokenMessages(ModalLinkUI)