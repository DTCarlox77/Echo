import re

def procesar_expresion(expresion):
    # Patrón para la etiqueta principal.
    patron_principal = re.compile(r'\((\w+)\((.*?)\)\)\[(.*?)\]')
    
    # Patrón para las propiedades.
    patron_propiedades = re.compile(r'(\w+)=(\w+)')
    
    # Patrón para el texto ligado a paréntesis.
    patron_texto_par = re.compile(r'(\w+)\((.*?)\)')
    
    # Buscar coincidencias en la expresión.
    coincidencias = patron_principal.findall(expresion)
    
    resultado_html = ''
    
    for coincidencia in coincidencias:
        etiqueta_padre = coincidencia[0]
        contenido_etiqueta = coincidencia[1]
        propiedades = coincidencia[2]
        
        # Reemplazar texto ligado a paréntesis.
        contenido_etiqueta = re.sub(r'(\w+)\((.*?)\)', r'<\1>\2</\1>', contenido_etiqueta)
        
        # Crear el formato HTML según las propiedades.
        etiqueta_html = f'<{etiqueta_padre}'

        # Procesar propiedades.
        propiedades_match = patron_propiedades.findall(propiedades)
        estilo = []
        for propiedad, valor in propiedades_match:
            
            # Ajustes para los nombres de propiedades.
            if propiedad == 'col':
                propiedad = 'color'
            elif propiedad == 'siz':
                propiedad = 'font-size'
                valor += 'px'
            elif propiedad == 'fon':
                propiedad = 'font-family'
            elif propiedad == 'bgc':
                propiedad = 'background-color'
            
            estilo.append(f'{propiedad}: {valor}')
        
        if estilo:
            etiqueta_html += f' style="{"; ".join(estilo)}"'
        
        etiqueta_html += f'>{contenido_etiqueta}</{etiqueta_padre}>'
        resultado_html += etiqueta_html

    return resultado_html
3