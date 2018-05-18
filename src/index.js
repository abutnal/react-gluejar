import { Component } from 'react'

// NOTE: `onPaste` should return an array of files that were acceptedFiles
//
// const Image = ({ src }) => <img src={image} alt={`Pasted: ${image}`} />
//
// <PasteContainer onPaste={files => this.method(files)} errorHandler={err => console.error(err)}>
//   {images => images.map((image, i) => <Image src={image} key={i} />)}
// </PasteContainer>

export default class Gluejar extends Component {
  static displayName = 'Gluejar'

  static defaultProps = {
    onPaste: () => null,
    errorHandler: () => null,
    acceptedFiles: ['image/gif', 'image/png', 'image/jpeg', 'image/bmp']
  }

  state = {
    items: []
  }

  getContainer = () => (this.props.container ? this.props.container : window)

  isValidFormat = fileType => this.props.acceptedFiles.includes(fileType)

  pasteHandler = e => this.checkPasted(e, this.pushImage)

  coercedItemArray = (items, cb) => {
    // NOTE: This needs to be a for loop
    if (window.Clipboard || window.ClipboardEvent) {
      for (let i = 0; i < items.length; i++) {
        if (this.isValidFormat(items[i].type) !== false) {
          let blob = items[i].getAsFile()
          let webkitBlob = items[i].webkitGetAsEntry()
          let URL = window.URL || window.webkitURL

          console.log(items[i])
          if (blob) {
            console.log(blob, webkitBlob)
            // We shouldn't fire the callback if we can't create `new Blob()`
            let src = URL.createObjectURL(blob)
            cb(src)
          }
        } else {
          this.props.errorHandler(`Sorry, that's not a format we support`)
        }
      }
    }
  }

  checkPasted = (e, cb) => {
    console.log(e)
    e.clipboardData && e.clipboardData.items.length > 0
      ? this.coercedItemArray(e.clipboardData.items, cb)
      : this.props.errorHandler(`Sorry, to bother you but there was no image pasted.`)
  }

  pushImage = source => this.setState(prevState => ({ items: [...prevState.items, source] }))

  componentDidMount() {
    const elm = this.getContainer()
    elm.addEventListener('paste', this.pasteHandler)
  }
  componentDidUpdate() {
    this.props.onPaste(this.state.items)
  }

  componentWillUnmount() {
    const elm = this.getContainer()
    elm.removeEventListener('paste', this.pasteHandler)
  }
  render() {
    const { items } = this.state

    return this.props.children(items)
  }
}
