import PropTypes from 'prop-types';

export default function EnhancedAudioPlayer() {
  return null;
}

EnhancedAudioPlayer.propTypes = {
  title: PropTypes.string,
  slowMp3Url: PropTypes.string,
  normalMp3Url: PropTypes.string,
  coverImage: PropTypes.string,
  transcript: PropTypes.string,
  allowDownload: PropTypes.bool,
  showSpeedControl: PropTypes.bool,
  highlightWords: PropTypes.bool,
  onWordHighlight: PropTypes.func
};