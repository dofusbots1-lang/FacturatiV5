import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateProps {
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function Template3Minimal({ data, type, includeSignature = false }: TemplateProps) {
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
      className="bg-white mx-auto relative"
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        maxWidth: '750px',
        display: 'table',
        tableLayout: 'fixed'
      }}
    >
      {/* Motifs décoratifs fixes */}
      <img
        src="https://i.ibb.co/svbQM5zT/p.png"
        alt="motif haut"
        className="absolute top-0 right-0 w-32 h-32 object-contain opacity-20 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <img
        src="https://i.ibb.co/d0JqGQsK/pp.png"
        alt="motif bas"
        className="absolute bottom-0 left-0 w-32 h-32 object-contain opacity-20 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* HEADER FIXE - répété sur chaque page */}
      <div
        className="bg-white border-b-2 border-[#0a1f44] p-6 text-center relative"
        style={{ display: 'table-header-group', zIndex: 10 }}
      >
        {user?.company.logo && (
          <img
            src={user.company.logo}
            alt="Logo"
            className="mx-auto mb-4"
            style={{ height: '60px', width: '60px' }}
          />
        )}
        <h1 className="text-2xl font-bold text-[#0a1f44]">{user?.company.name}</h1>
        <h2 className="text-xl font-semibold mt-2 uppercase tracking-wide text-[#0a1f44]">{title}</h2>
      </div>

      {/* FOOTER FIXE - répété sur chaque page */}
      <div
        className="bg-[#0a1f44] text-white p-4 text-center text-xs"
        style={{ display: 'table-footer-group' }}
      >
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

      {/* CONTENU PRINCIPAL - peut s'étendre sur plusieurs pages */}
      <div style={{ display: 'table-row-group', position: 'relative', zIndex: 10 }}>
        {/* Informations client et dates */}
        <div className="p-6 border-b border-[#0a1f44]">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded border border-[#0a1f44] shadow-sm">
              <h3 className="font-bold text-[#0a1f44] mb-2 border-b border-[#0a1f44] pb-1 text-center text-sm">
                CLIENT
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{data.client.name}</p>
                <p>{data.client.address}</p>
                <p><strong>ICE:</strong> {data.client.ice}</p>
                <p><strong>Tél:</strong> {data.client.phone}</p>
                <p><strong>Email:</strong> {data.client.email}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-[#0a1f44] shadow-sm">
              <h3 className="font-bold text-sm text-[#0a1f44] mb-2 border-b border-[#0a1f44] pb-1 text-center">
                INFORMATIONS
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>{title} N°:</strong> {data.number}</p>
                <p><strong>Date:</strong> {new Date(data.date).toLocaleDateString('fr-FR')}</p>
                {type === 'quote' && 'validUntil' in data && (
                  <p><strong>Valide jusqu'au:</strong> {new Date(data.validUntil).toLocaleDateString('fr-FR')}</p>
                )}
                {type === 'invoice' && 'dueDate' in data && data.dueDate && (
                  <p><strong>Échéance:</strong> {new Date(data.dueDate).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des produits - peut s'étendre sur plusieurs pages */}
        <div className="p-6">
          <table className="w-full border-collapse border border-[#0a1f44]">
            <thead className="bg-[#0a1f44] text-white">
              <tr>
                <th className="border border-white px-4 py-3 text-center font-bold text-sm">DÉSIGNATION</th>
                <th className="border border-white px-4 py-3 text-center font-bold text-sm">QUANTITÉ</th>
                <th className="border border-white px-4 py-3 text-center font-bold text-sm">P.U. HT</th>
                <th className="border border-white px-4 py-3 text-center font-bold text-sm">TOTAL HT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="avoid-break-inside hover:bg-gray-50">
                  <td className="border border-[#0a1f44] px-4 py-3 text-sm">{item.description}</td>
                  <td className="border border-[#0a1f44] px-4 py-3 text-center text-sm">
                    {item.quantity.toFixed(3)} ({item.unit || 'unité'})
                  </td>
                  <td className="border border-[#0a1f44] px-4 py-3 text-center text-sm">
                    {item.unitPrice.toFixed(2)} MAD
                  </td>
                  <td className="border border-[#0a1f44] px-4 py-3 text-center font-semibold text-sm">
                    {item.total.toFixed(2)} MAD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="p-6">
          <div className="flex justify-between">
            {/* Bloc gauche - Montant en lettres */}
            <div className="w-80 bg-white rounded border border-[#0a1f44] p-4 shadow-sm">
              <p className="text-sm font-bold border-b border-[#0a1f44] pb-2 text-center text-[#0a1f44]">
                Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :
              </p>
              <p className="text-sm pt-2 text-[#0a1f44]">• {data.totalInWords}</p>
            </div>

            {/* Bloc droit - Calculs */}
            <div className="w-80 bg-white rounded border border-[#0a1f44] p-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total HT :</span>
                  <span className="font-medium">{data.subtotal.toFixed(2)} MAD</span>
                </div>

                {/* TVA détaillée */}
                {Object.keys(vatGroups).map((rate) => (
                  <div key={rate} className="flex justify-between text-sm">
                    <span>
                      TVA {rate}%
                      {Object.keys(vatGroups).length > 1 && vatGroups[+rate].products.length > 0 && (
                        <span className="text-xs text-gray-500 block">
                          ({vatGroups[+rate].products.join(', ')})
                        </span>
                      )}
                    </span>
                    <span className="font-medium">{vatGroups[+rate].amount.toFixed(2)} MAD</span>
                  </div>
                ))}

                <div className="flex justify-between text-sm font-bold border-t border-[#0a1f44] pt-2 text-[#0a1f44]">
                  <span>TOTAL TTC :</span>
                  <span>{data.totalTTC.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="px-6 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Conditions :</strong> 
              {type === 'quote' 
                ? `Ce devis est valable jusqu'au ${'validUntil' in data ? new Date(data.validUntil).toLocaleDateString('fr-FR') : ''}.`
                : 'Règlement à 30 jours. Merci de votre confiance.'
              }
            </p>
          </div>
        </div>

        {/* SIGNATURE - Nouvelle page si nécessaire */}
        {includeSignature && user?.company?.signature && (
          <div className="break-before-page p-6" style={{ minHeight: '200px' }}>
            <div className="flex justify-start">
              <div className="w-60 bg-gray-50 border border-black rounded p-4 text-center">
                <div className="text-sm font-bold mb-3">Signature</div>
                <div className="border-2 border-black rounded h-20 flex items-center justify-center">
                  <img 
                    src={user.company.signature} 
                    alt="Signature" 
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}