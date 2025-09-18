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

  // Regroupement TVA
  const getVatGroups = () => {
    return data.items.reduce(
      (acc: Record<number, { amount: number; products: string[] }>, item) => {
        const vatAmount = (item.unitPrice * item.quantity * item.vatRate) / 100;
        if (!acc[item.vatRate]) acc[item.vatRate] = { amount: 0, products: [] };
        acc[item.vatRate].amount += vatAmount;
        if (item.vatRate !== 20) {
          acc[item.vatRate].products.push(item.description);
        }
        return acc;
      },
      {}
    );
  };

  const vatGroups = getVatGroups();

  return (
    <div
      className="bg-white mx-auto border border-black"
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        maxWidth: '750px',
        display: 'table',
        tableLayout: 'fixed'
      }}
    >
      {/* HEADER répété sur chaque page */}
      <div style={{ display: 'table-header-group' }}>
        <div className="p-8 border-b border-black bg-black text-white text-center">
          <div className="flex items-center justify-between">
            {user?.company.logo && (
              <img src={user.company.logo} alt="Logo" className="h-20 w-auto" />
            )}
            <div className="flex-1 text-center">
              <h2 className="text-3xl font-extrabold">{user?.company.name}</h2>
              <h1 className="text-xl font-bold mt-2">{title}</h1>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* FOOTER répété sur chaque page */}
      <div style={{ display: 'table-footer-group' }}>
        <div className="bg-black text-white p-4 text-center text-xs">
          <p>
            <strong>{user?.company.name}</strong> | {user?.company.address} | 
            <strong>Tél :</strong> {user?.company.phone} | 
            <strong>ICE :</strong> {user?.company.ice} | 
            <strong>IF:</strong> {user?.company.if} | 
            <strong>RC:</strong> {user?.company.rc} | 
            <strong>CNSS:</strong> {user?.company.cnss} | 
            <strong>Patente :</strong> {user?.company.patente} | 
            <strong>EMAIL :</strong> {user?.company.email} | 
            <strong>SITE WEB :</strong> {user?.company.website}
          </p>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{ display: 'table-row-group' }}>
        {/* Bloc client et dates */}
        <div className="p-6 border-b border-black">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded border border-black text-center">
              <h3 className="font-bold text-sm text-black mb-2 border-b border-black pb-1">
                CLIENT
              </h3>
              <p className="font-medium">{data.client.name}</p>
              <p>{data.client.address}</p>
              <p><strong>ICE:</strong> {data.client.ice}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-black text-center">
              <h3 className="font-bold text-sm text-black mb-2 border-b border-black pb-1">
                INFORMATIONS
              </h3>
              <p><strong>{title} N°:</strong> {data.number}</p>
              <p><strong>Date:</strong> {new Date(data.date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Tableau Produits */}
        <div className="p-6">
          <table className="w-full border-collapse border border-black">
            <thead className="bg-black text-white">
              <tr>
                <th className="border border-white px-4 py-2 text-center">DÉSIGNATION</th>
                <th className="border border-white px-4 py-2 text-center">QUANTITÉ</th>
                <th className="border border-white px-4 py-2 text-center">P.U. HT</th>
                <th className="border border-white px-4 py-2 text-center">TOTAL HT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-t border-black avoid-break-inside">
                  <td className="px-4 py-2 text-center">{item.description}</td>
                  <td className="px-4 py-2 text-center">
                    {item.quantity.toFixed(3)} ({item.unit || 'unité'})
                  </td>
                  <td className="px-4 py-2 text-center">{item.unitPrice.toFixed(2)} MAD</td>
                  <td className="px-4 py-2 text-center">{item.total.toFixed(2)} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="p-6">
          <div className="flex justify-between">
            <div className="w-72 bg-gray-50 border border-black p-4">
              <p className="text-sm font-bold border-b border-black pb-2 text-center">
                Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :
              </p>
              <p className="text-sm pt-2">• {data.totalInWords}</p>
            </div>
            <div className="w-72 bg-gray-50 border border-black p-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Total HT :</span>
                <span>{data.subtotal.toFixed(2)} MAD</span>
              </div>
              {Object.keys(vatGroups).map((rate) => (
                <div key={rate} className="flex justify-between text-sm mb-1">
                  <span>
                    TVA {rate}%
                    {rate !== '20' && vatGroups[+rate].products.length > 0 && (
                      <span className="text-xs text-gray-600"> ({vatGroups[+rate].products.join(', ')})</span>
                    )}
                  </span>
                  <span>{vatGroups[+rate].amount.toFixed(2)} MAD</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t border-black pt-2 text-sm">
                <span>TOTAL TTC :</span>
                <span>{data.totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature → forcée sur nouvelle page si pas de place */}
        {includeSignature && (
          <div className="break-before-page p-6">
            <div className="flex justify-start">
              <div className="w-60 bg-gray-50 border border-black p-4 text-center">
                <div className="text-sm font-bold mb-3">Signature</div>
                <div className="border-2 border-black h-20 flex items-center justify-center">
                  {user?.company?.signature ? (
                    <img
                      src={user.company.signature}
                      alt="Signature"
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
