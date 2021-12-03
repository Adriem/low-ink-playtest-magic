const Card = ({ borderColor, backgroundColor }) => (
  <div className="card-container" style={{
    position: 'relative',
    width: '100%',
    paddingTop: '140%',
    fontFamily: 'serif',
  }}>
    <div className="card-frame" style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      border: '4px solid black',
      borderRadius: '4.9%/3.5%',
      backgroundColor: 'white',
    }}>
      <div className={`card-background ${backgroundColor || ''}`} style={{
        position: 'absolute',
        top: '2%',
        bottom: '9%',
        left: '3%',
        right: '3%',
        border: '2px solid black',
        borderTopLeftRadius: '2.8% 2%',
        borderTopRightRadius: '2.8% 2%',
        borderBottomRightRadius: '9% 8%',
        borderBottomLeftRadius: '9% 8%',
      }}>

        <div className={`card-title-border content-border ${borderColor || ''}`} style={{
          position: 'absolute',
          top: '1.5%',
          height: '6.75%',
          left: '1%',
          right: '1%',
          borderRadius: '2.5% / 50%',
          padding: '.75%',
        }}>
          <div className="card-title-box" style={{
            borderRadius: '2.5% / 50%',
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            border: '2px solid black',
            boxSizing: 'border-box',
            display: 'flex',
            padding: '1%',
            fontWeight: 'bold',
            fontSize: '175%'
          }}>
            <div className="card-title-container" style={{ padding: '0 1.5%' }}>Craterhoof behemoth</div>
            <div style={{ flex: 1 }} />
            <div className="card-mana-container">3GGG</div>
          </div>
        </div>

        <div className={`card-art-border content-border ${borderColor || ''}`} style={{
          position: 'absolute',
          top: '9%',
          height: '51%',
          left: '3%',
          right: '3%',
          padding: '0.5% 1%'
        }}>
          <div className="card-art-box" style={{
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            border: '2px solid black',
            boxSizing: 'border-box',
          }}>
            <img
              alt="Art"
              src="https://c1.scryfall.com/file/scryfall-cards/art_crop/front/4/4/44afd414-cc69-4888-ba12-7ea87e60b1f7.jpg?1601079153"
              height="100%"
              width="100%"
              style={{
                filter: 'brightness(1.5) grayscale(1) contrast(20)',
              }}
              />
          </div>
        </div>

        <div className={`card-type-border content-border ${borderColor || ''}`} style={{
          position: 'absolute',
          top: '60.5%',
          height: '6.75%',
          left: '1%',
          right: '1%',
          borderRadius: '2.5% / 50%',
          padding: '.75%',
        }}>
          <div className="card-type-box" style={{
            borderRadius: '2.5% / 50%',
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            border: '2px solid black',
            boxSizing: 'border-box',
            display: 'flex',
            padding: '1%',
            fontWeight: 'bold',
            fontSize: '140%'
          }}>
            <div className="card-type-container" style={{ padding: '0 1.5%' }}>Creature — Beast</div>
            <div style={{ flex: 1 }} />
            <div className="card-set-container">[P]</div>
          </div>
        </div>

        <div className={`card-oracle-border content-border ${borderColor || ''}`} style={{
          position: 'absolute',
          top: '68%',
          height: '34%',
          left: '3%',
          right: '3%',
          padding: '0.5% 1% 1%'
        }}>
          <div className="card-oracle-box" style={{
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            border: '2px solid black',
            boxSizing: 'border-box',
            fontSize: '140%',
            lineHeight: .9,
            padding: '5% 1%',
          }}>
            <p style={{ margin: '1.5% 0' }}>Haste</p>
            <p style={{ margin: '1.5% 0' }}>When Craterhoof Behemoth enters the battlefield, creatures you control gain trample and get +X/+X until end of turn, where X is the number of creatures you control.</p>
          </div>
        </div>

        <div className={`card-type-border content-border ${borderColor || ''}`} style={{
          position: 'absolute',
          top: '98%',
          height: '6%',
          width: '17%',
          right: '1.5%',
          borderRadius: '8.5% / 50%',
          padding: '1%',
        }}>
          <div className="card-stats-box" style={{
            borderRadius: '8.5% / 50%',
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            border: '2px solid black',
            boxSizing: 'border-box',
            fontWeight: 'bold',
            fontSize: '190%',
            textAlign: 'center',
            lineHeight: 1,
          }}>
            5/5
          </div>
      </div>

    </div>
  </div>
</div>
);

export default Card;