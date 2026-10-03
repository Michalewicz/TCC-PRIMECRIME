import { Fragment, useRef } from 'react';
import { useAutoScroll } from '../../hooks/useAutoScroll';

/**
 * Scrollable legend that slowly scrolls itself so long lists can be read without interaction.
 * `items` are { index, label, color, hidden, group? }, with items of the same group adjacent.
 */
function ChartLegend({ items, label, onToggle, onHighlight }) {
  const listRef = useRef(null);
  useAutoScroll(listRef, { enabled: items.length > 0 });

  let previousGroup;
  return (
    <ul className="chart-legend" ref={listRef} aria-label={label}>
      {items.map((item) => {
        const startsGroup = item.group && item.group !== previousGroup;
        previousGroup = item.group;
        return (
          <Fragment key={item.index}>
            {startsGroup && <li className="chart-legend-group">{item.group}</li>}
            <li>
              <button
                type="button"
                className={`chart-legend-item${item.hidden ? ' is-hidden' : ''}`}
                aria-pressed={!item.hidden}
                title={item.label}
                onClick={() => onToggle(item.index)}
                onMouseEnter={() => onHighlight(item.index)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(item.index)}
                onBlur={() => onHighlight(null)}
              >
                <span className="chart-legend-swatch" style={{ backgroundColor: item.color }} aria-hidden="true" />
                <span className="chart-legend-label">{item.label}</span>
              </button>
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
}

export default ChartLegend;
