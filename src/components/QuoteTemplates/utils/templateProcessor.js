import { processField } from '../../../utils/templateProcessing/fieldProcessor';
    import { processConditionals } from '../../../utils/templateProcessing/conditionalProcessor';
    import { processVariables } from '../../../utils/templateProcessing/variableProcessor';
    import { formatDate } from '../../../utils/dateFormatting';
    import { formatCurrency } from '../../../utils/formatters';

    export const processTemplate = async (template, audit, damageRecords, damagePrices) => {
      if (!template) return '';

      try {
        let content = template.content;

        // Replace basic audit fields
        const auditFields = {
          reference_number: audit.reference_number,
          audit_date: new Date(audit.audit_date).toLocaleDateString(),
          auditor_name: audit.auditor_name,
          site_name: audit.site_name,
          company_name: audit.company_name,
          red_risks: audit.red_risks || 0,
          amber_risks: audit.amber_risks || 0,
          green_risks: audit.green_risks || 0,
          notes: audit.notes || ''
        };

        // Replace audit fields
        Object.entries(auditFields).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          content = content.replace(regex, value);
        });

        // Process damage records
        if (content.includes('{{#each damage_records}}')) {
          let damageContent = '';
          for (const record of damageRecords) {
            let recordTemplate = content.match(/{{#each damage_records}}([\s\S]*?){{\/each}}/)[1];
            
            // Replace record fields
            const recordFields = {
              damage_type: record.damage_type,
              risk_level: record.risk_level,
              location_details: record.location_details,
              recommendation: record.recommendation,
              notes: record.notes || '',
              photo_url: record.photo_url || '',
              price: damagePrices[record.damage_type] || 0
            };

            Object.entries(recordFields).forEach(([key, value]) => {
              const regex = new RegExp(`{{${key}}}`, 'g');
              recordTemplate = recordTemplate.replace(regex, value);
            });

            // Process photo conditional
            if (record.photo_url) {
              try {
                const response = await fetch(record.photo_url);
                const blob = await response.blob();
                const base64 = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
                recordTemplate = recordTemplate.replace(
                  /{{#if photo_url}}([\s\S]*?){{\/if}}/g,
                  `<div class="damage-photo"><img src="${base64}" alt="Damage" style="max-width: 400px; max-height: 250px; width: auto; height: auto; object-fit: contain; margin: 10px auto; display: block;" /></div>`
                );
              } catch (error) {
                console.error('Error fetching or converting image:', error);
                recordTemplate = recordTemplate.replace(
                  /{{#if photo_url}}[\s\S]*?{{\/if}}/g,
                  ''
                );
              }
            } else {
              recordTemplate = recordTemplate.replace(
                /{{#if photo_url}}[\s\S]*?{{\/if}}/g,
                ''
              );
            }

            damageContent += recordTemplate;
          }

          content = content.replace(
            /{{#each damage_records}}[\s\S]*?{{\/each}}/,
            damageContent
          );
        }

        // Clean up any remaining template tags
        content = content.replace(/{{#if\s+.*?}}.*?{{\/if}}/gs, '');
        content = content.replace(/{{.*?}}/g, '');

        // Sanitize content
        const sanitizedContent = DOMPurify.sanitize(content);
        return sanitizedContent;
      } catch (error) {
        console.error('Error processing template:', error);
        return '<div class="error">Error processing template</div>';
      }
    };
