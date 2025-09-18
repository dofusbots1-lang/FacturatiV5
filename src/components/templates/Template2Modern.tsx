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

  // Hauteurs du header/footer en px (doivent matcher le CSS print plus bas)
  const HEADER_H = 130;
  const FOOTER_H = 90;

  return (
    <div
      className="bg-white mx-auto border border-black flex flex-col relative"
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        maxWidth: '750px',   // ~A4 en px
      }}
    >
      {/* --- STYLES PRINT --- */}
      <style>{`
        @page {
          margin: 20mm;
        }
        /* Réserver l'espace du header/footer sur chaque page */
        @media print {
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: ${HEADER_H}px;
            z-index: 1000;
          }
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: ${FOOTER_H}px;
            z-index: 1000;
          }
          .print-body {
            margin-top: ${HEADER_H + 10}px;   /* un petit buffer */
            margin-bottom: ${FOOTER_H + 10}px;
          }
          /* Répéter l'en-tête du tableau et éviter les coupures moches */
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr, img, .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* HEADER (répété automatiquement à l'impression) */}
      <div className="print-header">
        <div className="p-6 border-b border-black bg-black text-white text-center">
          <div className="flex items-center justify-between">
            {/* Logo */}
            {user?.company.logo ? (
              <img src={user.company.logo} alt="Logo" className="h-20 w-auto" />
            ) : (
              <div className="h-20 w-24" />
            )}

            {/* Nom de l'entreprise centré */}
            <div className="flex-1 text-center">
              <h2 className="text-3xl font-extrabold">{user?.company.name}</h2>
              <h1 className="text-xl font-bold mt-1">{title}</h1>
            </div>

            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
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
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead className="bg-black text-white">
                <tr>
                  <th className="border border-white px-3 py-2 text-center font-bold text-sm">DÉSIGNATION</th>
                  <th className="border border-white px-3 py-2 text-center font-bold text-sm">QUANTITÉ</th>
                  <th className="border border-white px-3 py-2 text-center font-bold text-sm">P.U. HT</th>
                  <th className="border border-white px-3 py-2 text-center font-bold text-sm">TOTAL HT</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-t border-black">
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
            {/* Bloc gauche */}
            <div className="w-80 bg-gray-50 border border-black rounded p-2 avoid-break">
              <div className="text-sm font-bold border-black pt-3 text-center pb-4">
                <p>Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :</p>
              </div>
              <div className="text-sm border-t border-black pt-3">
                <p className="text-black">• {data.totalInWords}</p>
              </div>
            </div>

            {/* Bloc droit */}
            <div className="w-80 bg-gray-50 border border-black rounded p-4 avoid-break">
              <div className="flex justify-between text-sm mb-2">
                <span>Total HT :</span>
                <span className="font-medium">{data.subtotal.toFixed(2)} MAD</span>
              </div>

              <div className="text-sm mb-2">
                {(() => {
                  const vatGroups = data.items.reduce(
                    (acc: Record<number, { amount: number; products: string[] }>, item) => {
                      const vatAmount = (item.unitPrice * item.quantity * (item.vatRate || 0)) / 100;
                      if (!acc[item.vatRate || 0]) acc[item.vatRate || 0] = { amount: 0, products: [] };
                      acc[item.vatRate || 0].amount += vatAmount;
                      acc[item.vatRate || 0].products.push(item.description);
                      return acc;
                    },
                    {} as Record<number, { amount: number; products: string[] }>
                  );
                  const vatRates = Object.keys(vatGroups);
                  return vatRates.map((rate) => (
                    <div key={rate} className="flex justify-between">
                      <span>
                        TVA : {rate}%{' '}
                        {vatRates.length > 1 && (
                          <span style={{ fontSize: '10px', color: '#555' }}>
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

        {/* SIGNATURE (protégée des coupures & du footer) */}
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
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">&nbsp;</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER (répété automatiquement à l'impression) */}
      <div
        className="print-footer bg-black text-white border-t-2 border-white p-4 text-xs text-center"
      >
        <p>
          <strong>{user?.company.name}</strong> | {user?.company.address} | <strong>Tél :</strong> {user?.company.phone} | <strong>ICE :</strong> {user?.company.ice} | <strong>IF:</strong> {user?.company.if} | <strong>RC:</strong> {user?.company.rc} | <strong>CNSS:</strong> {user?.company.cnss} | <strong>Patente :</strong> {user?.company.patente} | <strong>EMAIL :</strong> {user?.company.email} | <strong>SITE WEB :</strong> {user?.company.website}
        </p>
      </div>
    </div>
  );
}
