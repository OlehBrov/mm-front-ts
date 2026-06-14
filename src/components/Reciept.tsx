import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import QRCodeLib from 'react-qr-code';
const QRCode = (QRCodeLib as any).default ?? QRCodeLib;
import ScrollbarsLib from 'react-custom-scrollbars-2';
const Scrollbars = (ScrollbarsLib as any).default ?? ScrollbarsLib;
import { clearBuyStatus } from '../redux/features/buyStatus';
import { useNavigate } from 'react-router-dom';
import { clearReciept } from '../redux/features/recieptSlice';

const CHECK_FLOW: Record<number, string> = {
  1: 'продаж',
  2: 'повернення',
  3: 'сервісне внесення',
  4: 'сервісне винесення',
  14: 'видача готівки',
  15: 'переказ коштів',
  16: 'видача готівки при переказі',
};

interface FiscalItem {
  code1: string;
  cnt: number;
  price: number | string;
  name: string;
  tg_print: string;
  discount?: { sum: number | string; tg_print: string };
}

interface FiscalTax {
  tg_name: string;
  tg_print: string;
  tax_sum: number | string;
}

interface FiscalPay {
  bank_id: string;
  term_id: string;
  operation: string;
  cardmask: string;
  auth_code: string;
  paysys: string;
  rrn: string;
  name: string;
  pay_sum: number | string;
}

interface FiscalData {
  items: FiscalItem[];
  check_type: number;
  pays: FiscalPay[];
  close: { sum: number | string; to_pay: number | string };
  taxes: FiscalTax[];
  date: string;
  last_comment: string[];
}

interface FiscalDoc {
  is_test?: boolean;
  company_name: string;
  shop_name: string;
  shop_address: string;
  company_edrpou: string;
  data: FiscalData;
  fiscal_number: string;
  qr_content: string[];
  rro_fiscal_number: string;
  is_offline?: boolean;
}

interface RecieptEntry {
  fiscal: FiscalDoc;
}

interface Props {
  fiscalResponse: Record<string, unknown>;
}

export const Reciept = ({ fiscalResponse }: Props) => {
  const [reciept, setReciept] = useState<RecieptEntry[]>([]);
  const [qrCode, setQrCode] = useState<string[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fiscalResponse) return;
    const entries: RecieptEntry[] = [];
    for (const tax of Object.values(fiscalResponse)) {
      if (tax === null) continue;
      entries.push(tax as RecieptEntry);
    }
    setReciept(entries);
  }, [fiscalResponse]);

  useEffect(() => {
    if (reciept.length > 0) {
      for (const recieptSingle of reciept) {
        if (recieptSingle.fiscal.data.items.length === 0) return;
        setQrCode([...recieptSingle.fiscal.qr_content]);
      }
    }
  }, [reciept]);

  const closeRecieptHandler = () => {
    dispatch(clearBuyStatus());
    dispatch(clearReciept());
    navigate('/products');
  };

  if (!reciept.length) {
    return (
      <div className="total-check-wrapper">
        <h1>Завантаження чеку</h1>
      </div>
    );
  }

  return (
    <div className="total-check-wrapper">
      <button className="check-close-button filled-text-button" onClick={closeRecieptHandler}>
        Закрити
      </button>
      <Scrollbars
        renderTrackVertical={(props: React.HTMLProps<HTMLDivElement>) => <div {...props} className="track-vertical" />}
        renderThumbVertical={(props: React.HTMLProps<HTMLDivElement>) => <div {...props} className="thumb-vertical" />}
        style={{ width: 800 }}
        thumbSize={190}
        autoHeight
        autoHeightMin={400}
        autoHeightMax={1500}
        universal={true}
        hideTracksWhenNotNeeded={true}
      >
        <div className="check-wrapper">
          {reciept.map((recieptDoc, idx) => {
            const { fiscal } = recieptDoc;
            if (!fiscal) return null;
            return (
              <div className="check" key={idx}>
                {fiscal.is_test && (
                  <div className="testCheckInfo">
                    <span>ТЕСТОВИЙ ЧЕК Не передається в податкову</span>
                  </div>
                )}
                <div className="check-header">
                  <h4>{fiscal.company_name}</h4>
                  <p>{fiscal.shop_name}</p>
                  <p>{fiscal.shop_address}</p>
                  <p>ІД {fiscal.company_edrpou}</p>
                </div>
                <div className="divider"></div>
                <div className="topComment">Ваші покупки</div>
                <div className="check-items-list">
                  {fiscal.data.items.map((item) => (
                    <div className="check-list-item" key={item.code1}>
                      <div className="product-line check-product-qty">
                        <p>{item.cnt} X {item.price}</p>
                      </div>
                      <div className="product-line check-barcode-line">
                        <p>Штрихкод</p>
                        <p>{item.code1}</p>
                      </div>
                      <div className="product-line check-product-name">
                        <p>{item.name}</p>
                        <div className="price-tax-wrap">
                          <p>{item.price}</p>
                          <p>{item.tg_print}</p>
                        </div>
                      </div>
                      {item.discount && (
                        <div className="product-line check-product-discount">
                          <p>Знижка</p>
                          <div className="price-tax-wrap">
                            <p>{item.discount.sum}</p>
                            <p>{item.discount.tg_print}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="divider"></div>
                <div className="check-tech-data-wrapper">
                  <div className="check-tech-text-wrapper"><p>{CHECK_FLOW[fiscal.data.check_type]}</p></div>
                  <div className="check-tech-text-wrapper"><p>{fiscal.data.pays[0].bank_id}</p></div>
                  <div className="check-tech-text-wrapper"><p>Термінал</p><p>{fiscal.data.pays[0].term_id}</p></div>
                  <div className="check-tech-text-wrapper"><p>Вид операції</p><p>{fiscal.data.pays[0].operation}</p></div>
                  <div className="check-tech-text-wrapper"><p>ЕПЗ</p><p>{fiscal.data.pays[0].cardmask}</p></div>
                  <div className="check-tech-text-wrapper"><p>Код авторизації</p><p>{fiscal.data.pays[0].auth_code}</p></div>
                  <div className="check-tech-text-wrapper"><p>Платіжна система</p><p>{fiscal.data.pays[0].paysys}</p></div>
                  <div className="check-tech-text-wrapper"><p>RRN</p><p>{fiscal.data.pays[0].rrn}</p></div>
                  <div className="check-tech-text-wrapper"><p>Касир</p></div>
                  <div className="check-tech-text-wrapper"><p>Держатель ЕПЗ</p></div>
                  <div className="check-tech-text-wrapper"><p>{fiscal.data.pays[0].name}</p><p>{fiscal.data.pays[0].pay_sum}</p></div>
                </div>
                <div className="divider"></div>
                <div className="check-payment-data-wrapper">
                  <div className="check-payment-text-wrapper"><p>Сума</p><p>{fiscal.data.close.sum}</p></div>
                  <div className="check-payment-text-wrapper">
                    <div className="price-tax-wrap">
                      <p>{fiscal.data.taxes[0].tg_name}</p>
                      <p>{fiscal.data.taxes[0].tg_print}</p>
                    </div>
                    <p>{fiscal.data.taxes[0].tax_sum}</p>
                  </div>
                  <div className="check-payment-text-wrapper"><p>До сплати</p><p>{fiscal.data.close.to_pay}</p></div>
                </div>
                <div className="divider"></div>
                <div className="check-comments-wrapper">
                  <p>Коментар</p>
                  <p>{fiscal.data.last_comment[0]}</p>
                </div>
                <div className="divider"></div>
                <div className="check-fiscals-wrapper">
                  <div className="check-fiscals-text-wrapper"><p>Фіск. номер чека:</p><p>{fiscal.fiscal_number}</p></div>
                  <div className="check-fiscals-text-wrapper"><p>{fiscal.data.date}</p></div>
                </div>
                <div className="divider"></div>
                {qrCode.length > 0 && (
                  <div className="check-qr-wrapper">
                    <div style={{ height: 'auto', margin: '0 auto', maxWidth: 200, width: '100%' }}>
                      <QRCode size={256} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} value={qrCode[idx]} viewBox="0 0 256 256" />
                    </div>
                  </div>
                )}
                <div className="divider"></div>
                <div className="check-footer">
                  <div className="text-wrapper footer-text-wrapper"><p>Режим роботи</p><p>{fiscal.is_offline ? 'Офлайн' : 'Онлайн'}</p></div>
                  <div className="text-wrapper footer-text-wrapper"><p>ФН ПРРО</p><p>{fiscal.rro_fiscal_number}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </Scrollbars>
    </div>
  );
};
