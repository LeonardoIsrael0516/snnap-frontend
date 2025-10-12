import { BiolinkBlock } from "@/lib/biolinkBlocks";

interface BlockRendererProps {
  block: BiolinkBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'links': {
      const linksColumns = block.data.columns || 1;
      const showIcons = block.data.showIcons || false;
      
      return (
        <div className={`biolink-grid ${linksColumns === 1 ? 'biolink-grid-1' : linksColumns === 2 ? 'biolink-grid-2' : 'biolink-grid-3'}`}>
          {(block.data.links || []).map((link: any, idx: number) => {
            const renderIcon = () => {
              if (!showIcons || !link.icon || link.iconType === 'none') return null;
              
              switch (link.iconType) {
                case 'emoji':
                  return <span className="mr-2 text-lg">{link.icon}</span>;
                case 'icon':
                  return <i className={`${link.icon} mr-2 text-lg`}></i>;
                case 'image':
                  return <img src={link.icon} alt="" className="w-5 h-5 mr-2 object-contain inline-block align-middle" />;
                default:
                  return null;
              }
            };

            return (
              <a
                key={idx}
                href={link.url || '#'}
                target={link.openInNewTab !== false ? '_blank' : '_self'}
                rel={link.openInNewTab !== false ? 'noopener noreferrer' : ''}
                className="block w-full p-3 rounded-lg transition-all hover:scale-105 text-center font-medium flex items-center justify-center"
                style={{
                  backgroundColor: link.backgroundColor || '#000000',
                  color: link.textColor || '#ffffff',
                  textDecoration: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {renderIcon()}
                {link.text || 'Link'}
              </a>
            );
          })}
        </div>
      );
    }

    case 'title': {
      const titleClasses = {
        h1: 'text-4xl font-bold',
        h2: 'text-3xl font-bold',
        h3: 'text-2xl font-semibold',
      };
      
      const titleColumns = block.data.columns || 1;
      const titles = block.data.titles || [{ 
        text: block.data.text || 'Título', 
        level: block.data.level || 'h2', 
        color: block.data.color || '#000000', 
        showIcon: block.data.showIcon || false, 
        iconType: block.data.iconType || 'none', 
        icon: block.data.icon || '' 
      }];
      
      const renderTitle = (titleData: any, index: number) => {
        const TitleTag = (titleData.level || 'h2') as keyof JSX.IntrinsicElements;
        const showIcon = titleData.showIcon || false;
        const iconType = titleData.iconType || 'none';
        const icon = titleData.icon || '';
        
        const renderIcon = () => {
          if (!showIcon || !icon || iconType === 'none') return null;
          
          switch (iconType) {
            case 'emoji':
              return <span className="mr-2 text-lg">{icon}</span>;
            case 'icon':
              return <i className={`${icon} mr-2 text-lg`}></i>;
            default:
              return null;
          }
        };

        const titleContent = (
          <>
            {renderIcon()}
            {titleData.text || `Título ${index + 1}`}
          </>
        );

        return (
          <TitleTag 
            key={index}
            className={`${titleClasses[titleData.level as keyof typeof titleClasses] || titleClasses.h2}`}
            style={{ 
              color: titleData.color || '#000000'
            }}
          >
            {titleContent}
          </TitleTag>
        );
      };

      if (titleColumns === 1) {
        const alignment = block.data.alignment || 'center';
        
        return (
          <div className="mb-4" style={{ textAlign: alignment as any }}>
            {renderTitle(titles[0], 0)}
          </div>
        );
      }

      return (
        <div className={`biolink-grid ${titleColumns === 2 ? 'biolink-grid-2' : 'biolink-grid-3'} mb-4`}>
          {titles.map((titleData: any, index: number) => (
            <div key={index} className="flex items-center justify-center">
              {renderTitle(titleData, index)}
            </div>
          ))}
        </div>
      );
    }

    case 'paragraph': {
      const textColor = block.data.color || '#000000';
      const backgroundColor = block.data.backgroundColor || 'transparent';
      const opacity = block.data.opacity || 100;
      const borderRadius = block.data.borderRadius || 0;
      const padding = block.data.padding || 16;
      
      // Lógica simples: se opacidade é 0, transparente
      let finalBackgroundColor = 'transparent';
      let finalBorder = 'none';
      
      if (opacity > 0 && backgroundColor !== 'transparent') {
        if (backgroundColor.startsWith('#')) {
          const hex = backgroundColor.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          finalBackgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
          finalBorder = '1px solid rgba(0,0,0,0.1)';
        } else {
          finalBackgroundColor = backgroundColor;
          finalBorder = '1px solid rgba(0,0,0,0.1)';
        }
      }
      
      return (
        <div
          className="whitespace-pre-wrap"
          style={{
            color: textColor,
            backgroundColor: finalBackgroundColor,
            borderRadius: `${borderRadius}px`,
            padding: `${padding}px`,
            border: finalBorder
          }}
        >
          {block.data.text || 'Parágrafo'}
        </div>
      );
    }

    case 'avatar': {
      const imageUrl = block.data.imageUrl || 'https://via.placeholder.com/150';
      const alt = block.data.alt || 'Avatar';
      const shape = block.data.shape || 'circle';
      const borderColor = block.data.borderColor || 'transparent';
      const borderWidth = block.data.borderWidth || 0;
      
      const hasBorder = borderColor !== 'transparent' && borderWidth > 0;
      
      const getBorderRadius = () => {
        switch (shape) {
          case 'circle': return '50%';
          case 'rounded': return '12px';
          case 'square': return '0px';
          default: return '50%';
        }
      };
      
      return (
        <div className="flex justify-center">
          <div
            className="overflow-hidden"
            style={{
              borderRadius: getBorderRadius(),
              border: hasBorder 
                ? `${borderWidth}px solid ${borderColor}` 
                : 'none'
            }}
          >
            <img
              src={imageUrl}
              alt={alt}
              className="w-32 h-32 object-cover"
            />
          </div>
        </div>
      );
    }

    case 'image': {
      const columns = block.data.columns || 1;
      const size = block.data.size || 'banner';
      const images = block.data.images || [{ imageUrl: '', alt: 'Imagem', link: '' }];

      const getImageDimensions = () => {
        switch (size) {
          case 'banner':
            return { width: '400px', height: '200px' };
          case 'rectangle':
            return { width: '300px', height: '150px' };
          case 'square':
            return { width: '200px', height: '200px' };
          default:
            return { width: '400px', height: '200px' };
        }
      };

      const getImageClasses = () => {
        return 'object-cover rounded-lg';
      };

      const renderImage = (image: any, index: number) => {
        const ImageWrapper = image.link ? 'a' : 'div';
        const imageProps = image.link ? {
          href: image.link,
          target: '_blank',
          rel: 'noopener noreferrer',
        } : {};

        return (
          <div key={index} className="flex justify-center">
            <ImageWrapper {...imageProps}>
              <img
                src={image.imageUrl || 'https://via.placeholder.com/400x200'}
                alt={image.alt || 'Imagem'}
                className={getImageClasses()}
                style={getImageDimensions()}
              />
            </ImageWrapper>
          </div>
        );
      };

      if (columns > 1) {
        return (
          <div className={`biolink-grid ${columns === 2 ? 'biolink-grid-2' : columns === 3 ? 'biolink-grid-3' : ''}`}>
            {images.slice(0, columns).map((image, index) => renderImage(image, index))}
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          {renderImage(images[0], 0)}
        </div>
      );
    }

    case 'social-media':
      return (
        <div className="flex justify-center gap-4 flex-wrap">
          {(block.data.platforms || []).map((platform: any, idx: number) => (
            <a
              key={idx}
              href={platform.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              {platform.platform.charAt(0).toUpperCase()}
            </a>
          ))}
        </div>
      );

    case 'divider': {
      const dividerStyle = {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted',
      }[block.data.style || 'solid'];
      return <hr className={`border-t-2 ${dividerStyle} my-4`} />;
    }

    case 'cta': {
      const ctaClasses = {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border-2 border-primary text-primary',
      }[block.data.style || 'primary'];
      return (
        <a
          href={block.data.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full p-4 rounded-lg hover:opacity-90 transition-opacity text-center font-bold ${ctaClasses}`}
        >
          {block.data.text || 'Botão'}
        </a>
      );
    }

    case 'image-builder': {
      const { width = 800, height = 400, backgroundColor = '#ffffff', elements = [], backgroundImage = null, backgroundType = 'color' } = block.data;
      
      const renderElement = (element: any) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg)`,
          opacity: element.opacity,
          zIndex: element.zIndex,
        };

        switch (element.type) {
          case 'text':
            return (
              <div key={element.id} style={style}>
                <div
                  style={{
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    fontWeight: element.fontWeight,
                    color: element.color,
                    textAlign: element.textAlign,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {element.text}
                </div>
              </div>
            );

          case 'image':
            return (
              <div key={element.id} style={style}>
                <img
                  src={element.imageUrl}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              </div>
            );

          case 'shape':
            const shapeStyle: React.CSSProperties = {
              width: '100%',
              height: '100%',
              backgroundColor: element.fillColor,
              border: `${element.strokeWidth}px solid ${element.strokeColor}`,
              borderRadius: element.shapeType === 'circle' ? '50%' : element.shapeType === 'triangle' ? '0' : '4px',
              clipPath: element.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
            };

            return (
              <div key={element.id} style={style}>
                <div style={shapeStyle} />
              </div>
            );

          case 'icon':
            return (
              <div key={element.id} style={style}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: Math.min(element.width, element.height) * 0.6,
                    color: element.iconColor
                  }}
                >
                  {element.iconName === 'star' ? '⭐' :
                   element.iconName === 'heart' ? '❤️' :
                   element.iconName === 'like' ? '👍' :
                   element.iconName === 'check' ? '✅' :
                   element.iconName === 'cross' ? '❌' : '⭐'}
                </div>
              </div>
            );

          default:
            return null;
        }
      };

      return (
        <div className="flex justify-center">
          <div
            style={{
              width: Math.min(width, 400), // Limitar largura máxima no preview
              height: Math.min(height, 200), // Limitar altura máxima no preview
              backgroundColor: backgroundType === 'color' ? backgroundColor : 'transparent',
              backgroundImage: backgroundType === 'image' && backgroundImage ? `url(${backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}
          >
            {elements.map(renderElement)}
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
          Bloco "{block.type}" (em desenvolvimento)
        </div>
      );
  }
}