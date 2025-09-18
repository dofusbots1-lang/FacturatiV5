import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateProps {
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function Template2Modern({ data, type, includeSignature = false }: TemplateProps) {
  const { user } = useAuth();
  const title = type === 'invoice' ? 'FACTURE' : 'DEVIS';

  // Largeur "page" et hauteurs header/footer (doivent être cohérentes avec le CSS ci-dessous)
  const PAGE_W = 750;   // px ~ A4 utile
  const HEADER_H = 130; // px
  const FOOTER_H = 90;  // px

  return (
    <div
      className="bg-white mx-auto relative"
      style={{ fontFamily: 'Arial, sans-serif', width: '100%', maxWidth: `${PAGE_W}px` }}
    >
      {/* === CSS PRINT STRICT === */}
      <style>{`
        @page { margin: 20mm; }

        /* Répétition header/footer à chaque page ET centrage exact */
        @media print {
          .print-header,
          .print-footer {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            width: ${PAGE_W}px;
            z-index: 1000;
          }
          .print-header { top: 0; height: ${HEADER_H}px; }
          .print-footer { bottom: 0; height: ${FOOTER_H}px; }

          /* Le contenu réserve la place du header/footer */
          .print-body {
            margin-top: ${HEADER_H + 10}px;
            margin-bottom: ${FOOTER_H + 10}px;
          }

          /* Répéter thead et éviter les découpes */
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }

          table { page-break-inside: auto; border-collapse: collapse; width: 100%; }
          tr, img, .avoid-break { page-break-inside: avoid; break-inside: avoid; }
          .page-break { page-break-before: always; }
        }

        /* Écran: garder une mise en page normale */
        @media screen {
          .print-header,
          .print-footer {
            position: sticky;
          }
          .print-header { top: 0; }
          .print-footer { bottom: 0; }
        }
      `}</style>

      {/* HEADER (répété en print) */}
      <div className="print-header">
        <div className="p-6 border-b border-black bg-black text-white text-center">
          <div className="flex items-center justify-between">
            {user?.company.logo ? (
              <img src={user.company.logo} alt="Logo" className="h-20 w-auto" />
            ) : (
              <div className="h-20 w-24" />
            )}
            <div className="flex-1 text-center">
              <h2 className="text-3xl font-extrabold">{user?.company.name}</h2>
              <h1 className="text-xl font-bold mt-1">{title}</h1>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* CORPS (réserve la place top/bottom en print) */}
      <div className="print-body">
        {/* CLIENT + DATES */}
        <div className="p-6 border-b border-black">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded border border-black">
              <h3 className="font-bold text-sm text-black mb-3 border-b border-black pb-2 text-center">
                CLIENT : {data.client.name} {data.client.address}
              </h3>
              <div className="text-sm text-black space-y-1 text-center">
                <p><strong>ICE:</strong> {data.client.ice}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded border border-black">
              <h3 className="font-bold text-sm text-black mb-3 border-b border-black pb-2 text-center">
                DATE : {new Date(data.date).toLocaleDateString('fr-FR')}
              </h3>
              <div className="text-sm text-black space-y-1 text-center">
                <p><strong>{type === 'invoice' ? 'FACTURE' : 'DEVIS'} N° :</strong> {data.number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE PRODUITS */}
        <div className="p-6 border-b border-black">
          <div className="border border-black rounded overflow-hidden">
            <table>
              <thead className="bg-black text-white">
                <tr>
                  <th className="border border-white px-3 py-2 text-center font-bold text-sm">DÉSIGNATION</th>
                  <th className="border border-white px-3 py-2 text-center font-bold text-sm">QUANTITÉ</th>
                  <th className="border border-white px-3 py-2 text-center font-bold text-sm">P.U. HT</th>
                  <th className="border border-white px-3 py-2 text-center font-bold text-sm">TOTAL HT</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={i} className="border-t border-black">
                    <td className="border border-black px-3 py-2 text-sm">{item.description}</td>
                    <td className="border border-black px-3 py-2 text-center text-sm">
                      {item.quantity.toFixed(3)} ({item.unit || 'unité'})
                    </td>
                    <td className="border border-black px-3 py-2 text-center text-sm">
                      {item.unitPrice.toFixed(2)} MAD
                    </td>
                    <td className="border border-black px-3 py-2 text-center font-medium">
                      {item.total.toFixed(2)} MAD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOTALS */}
        <div className="p-6">
          <div className="flex justify-between flex-wrap gap-4">
            <div className="w-80 bg-gray-50 border border-black rounded p-2 avoid-break">
              <div className="text-sm font-bold pt-3 text-center pb-4">
                <p>Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :</p>
              </div>
              <div className="text-sm border-t border-black pt-3">
                <p className="text-black">• {data.totalInWords}</p>
              </div>
            </div>

            <div className="w-80 bg-gray-50 border border-black rounded p-4 avoid-break">
              <div className="flex justify-between text-sm mb-2">
                <span>Total HT :</span>
                <span className="font-medium">{data.subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="text-sm mb-2">
                {(() => {
                  const vatGroups = data.items.reduce((acc: Record<number, {amount: number; products: string[]}>, it) => {
                    const rate = it.vatRate || 0;
                    const vatAmount = (it.unitPrice * it.quantity * rate) / 100;
                    if (!acc[rate]) acc[rate] = { amount: 0, products: [] };
                    acc[rate].amount += vatAmount;
                    acc[rate].products.push(it.description);
                    return acc;
                  }, {});
                  return Object.keys(vatGroups).map(rate => (
                    <div key={rate} className="flex justify-between">
                      <span>
                        TVA : {rate}% {Object.keys(vatGroups).length > 1 && (
                          <span style={{ fontSize: 10, color: '#555' }}>
                            ({vatGroups[+rate].products.join(', ')})
                          </span>
                        )}
                      </span>
                      <span className="font-medium">{vatGroups[+rate].amount.toFixed(2)} MAD</span>
                    </div>
                  ));
                })()}
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-black pt-3">
                <span>TOTAL TTC :</span>
                <span>{data.totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIGNATURE — évite la coupure, saute à la page suivante si nécessaire */}
        <div className="p-6 avoid-break" style={{ marginBottom: 8 }}>
          <div className="flex justify-start">
            <div className="w-60 bg-gray-50 border border-black rounded p-4 text-center">
              <div className="text-sm font-bold mb-3">Signature</div>
              <div className="border-2 border-black rounded-sm h-20 flex items-center justify-center relative">
                {includeSignature && user?.company?.signature ? (
                  <img
                    src={user.company.signature}
                    alt="Signature"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">&nbsp;</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER (répété en print) */}
      <div className="print-footer bg-black text-white border-t-2 border-white p-4 text-xs text-center">
        <p>
          <strong>{user?.company.name}</strong> | {user?.company.address} |
          <strong> Tél :</strong> {user?.company.phone} | <strong>ICE :</strong> {user?.company.ice} |
          <strong> IF:</strong> {user?.company.if} | <strong>RC:</strong> {user?.company.rc} |
          <strong> CNSS:</strong> {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} |
          <strong> EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong> {user?.company.website}
        </p>
      </div>
    </div>
  );
}
