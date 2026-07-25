export default function CornerTicks({ size = 22 }) {
  const px = typeof size === "number" ? size : parseFloat(size) || 22;
  const offset = -px / 2;
  const style = { width: px, height: px };
  const pos = {
    tl: { top: offset, left: offset },
    tr: { top: offset, right: offset },
    bl: { bottom: offset, left: offset },
    br: { bottom: offset, right: offset },
  };
  return (
    <span className="ab-corner-ticks" aria-hidden="true">
      <img
        className="ab-corner-ticks__tl"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.tl }}
      />
      <img
        className="ab-corner-ticks__tr"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.tr }}
      />
      <img
        className="ab-corner-ticks__bl"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.bl }}
      />
      <img
        className="ab-corner-ticks__br"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.br }}
      />
    </span>
  );
}
