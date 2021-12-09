const Reference = ({ multiverseId }) => (
  <img
    alt="Reference card"
    src={`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${multiverseId}&type=card`}
    style={{ width: '100%', height: 'auto' }}
  />
);

export default Reference
