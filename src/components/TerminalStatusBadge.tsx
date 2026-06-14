import { useSelector } from 'react-redux';
import { selectTerminalState } from '../redux/selectors/selectors';

const TITLES: Record<string, string> = {
  online:  'Термінал підключено',
  offline: 'Термінал недоступний',
  unknown: 'Перевірка терміналу...',
};

export const TerminalStatusBadge = () => {
  const { status } = useSelector(selectTerminalState);

  const dotClass =
    status === 'online'  ? 'terminal-badge__dot--online'  :
    status === 'offline' ? 'terminal-badge__dot--offline' :
                           'terminal-badge__dot--unknown';

  return (
    <div className="terminal-badge" title={TITLES[status] ?? 'Термінал'}>
      <img src="/img/icons/nfc.svg" alt="terminal" className="terminal-badge__icon" />
      <span className={`terminal-badge__dot ${dotClass}`} />
    </div>
  );
};
