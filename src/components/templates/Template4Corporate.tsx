import React from 'react';
import { Invoice, Quote } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateProps {
  data: Invoice | Quote;
  type: 'invoice' | 'quote';
  includeSignature?: boolean;
}

export default function Template4Corporate({ data, type, includeSignature = false }: TemplateProps) {
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
      className="bg-white mx-auto"
      style={{
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        maxWidth: '750px',
        display: 'table',
        tableLayout: 'fixed'
      }}
    >
      {/* HEADER FIXE avec vague - répété sur chaque page */}
      <div
        className="relative bg-[#24445C] text-white p-6"
        style={{ display: 'table-header-group' }}
      >
        <div className="flex items-center justify-between relative z-10">
          {user?.company.logo && (
            <img
              src={user.company.logo}
              alt="Logo"
              className="h-20 w-auto"
            />
          )}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wide">{user?.company.name}</h1>
            <h2 className="text-xl font-semibold mt-2 tracking-widest">{title}</h2>
          </div>
          <div className="w-20" />
        </div>

        {/* Vague blanche en bas */}
        <svg
          className="absolute bottom-0 left-0 w-full h-6"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,48 C180,96 360,12 540,60 C720,108 900,36 1080,84 C1260,120 1440,72 1440,72 L1440,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* FOOTER FIXE avec vague - répété sur chaque page */}
      <div
        className="relative bg-[#24445C] text-white p-4 text-center text-xs"
        style={{ display: 'table-footer-group' }}
      >
        {/* Vague blanche en haut */}
        <svg
          className="absolute top-0 left-0 w-full h-6"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 L0,48 C180,72 360,12 540,48 C720,84 900,24 1080,60 C1260,96 1440,36 1440,36 L1440,0 Z"
            fill="#ffffff"
          />
        </svg>

        <div className="pt-6 relative z-10">
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

      {/* CONTENU PRINCIPAL - peut s'étendre sur plusieurs pages */}
      <div style={{ display: 'table-row-group' }}>
        {/* Informations client et dates */}
        <div className="p-6 border-b border-[#24445C]">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded border border-[#24445C]">
              <h3 className="font-bold text-sm text-[#24445C] mb-2 border-b border-[#24445C] pb-1 text-center">
                CLIENT
              </h3>
              <div className="text-sm text-black space-y-1">
                <p className="font-medium">{data.client.name}</p>
                <p>{data.client.address}</p>
                <p><strong>ICE:</strong> {data.client.ice}</p>
                <p><strong>Tél:</strong> {data.client.phone}</p>
                <p><strong>Email:</strong> {data.client.email}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded border border-[#24445C]">
              <h3 className="font-bold text-sm text-[#24445C] mb-2 border-b border-[#24445C] pb-1 text-center">
                INFORMATIONS
              </h3>
              <div className="text-sm text-black space-y-1">
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
          <table className="w-full border-collapse border border-[#24445C]">
            <thead className="bg-[#24445C] text-white">
              <tr>
                <th className="border border-white px-4 py-3 text-center font-bold text-sm">DÉSIGNATION</th>
                <th className="border border-white px-4 py-3 text-center font-bold text-sm">QUANTITÉ</th>
                <th className="border border-white px-4 py-3 text-center font-bold text-sm">P.U. HT</th>
                <th className="border border-white px-4 py-3 text-center font-bold text-sm">TOTAL HT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="avoid-break-inside">
                  <td className="border border-[#24445C] px-4 py-3 text-sm">{item.description}</td>
                  <td className="border border-[#24445C] px-4 py-3 text-center text-sm">
                    {item.quantity.toFixed(3)} ({item.unit || 'unité'})
                  </td>
                  <td className="border border-[#24445C] px-4 py-3 text-center text-sm">
                    {item.unitPrice.toFixed(2)} MAD
                  </td>
                  <td className="border border-[#24445C] px-4 py-3 text-center font-semibold text-sm">
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
            <div className="w-80 bg-gray-50 rounded border border-[#24445C] p-4">
              <p className="text-sm font-bold text-center text-[#24445C] pb-2 border-b border-[#24445C]">
                Arrêtée le présent {type === 'invoice' ? 'facture' : 'devis'} à la somme de :
              </p>
              <p className="text-sm pt-2 text-black">• {data.totalInWords}</p>
            </div>

            {/* Bloc droit - Calculs */}
            <div className="w-80 bg-gray-50 rounded border border-[#24445C] p-4">
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

                <div className="flex justify-between text-sm font-bold border-t border-[#24445C] pt-2 text-black">
                  <span>TOTAL TTC :</span>
                  <span>{data.totalTTC.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
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