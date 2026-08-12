# Refactoring guide

## Forms

1. skopirovat FormXXX.tsx do FC a original presunut do CC
2. Cely novy FC/FormXXX.tsx zakomentovat
3. Na zaciatok FC/FormXXX.tsx vlozit kod nizsie a "XXX" zamentit podla potreby:


```
import React from 'react';
import Translator from '@hubleto/react-ui/core/Translator';
import { FormProps } from '@hubleto/react-ui/components/fc/FormInterfaces';
import Form, { FormMetaContext } from '@hubleto/react-ui/components/fc/Form';
import Input from '@hubleto/react-ui/components/fc/FormComponents/Input';

export interface FormXXXProps extends FormProps {}

const componentName = 'FormXXX'; // must be the same as the exported const
const parentApp = 'Hubleto/App/Community/AppXXX';
const T = new Translator(parentApp + '/Loader', 'Components/' + componentName);

/** TabDefault */
const TabDefault = (props: FormXXXProps) => {
  const form = React.useContext(FormMetaContext);
  return <>
    <Input field='name' customInputProps={{readonly: true, cssClass: 'text-2xl'}}/>
  </>;
}

/** FormXXX */
const FormXXX = (props: FormXXXProps) => {
  return <Form
    componentName={componentName}
    parentApp={parentApp}
    model={parentApp + '/Models/XXX'}
    urlSlug='parent-app-slug/same-url-slug-as-in-table'
    endpointParams={{}}
    // onAfterFormInitialized={(form: any) => {}}
    title={{field: 'some-field-of-the-record', sub: T.translate(componentName)}}
    tabs={{default: {content: () => <TabDefault {...props} />}}}
    {...props}
  ></Form>;
}

export default FormXXX;
```


3. Nastavit konstanty componentName a parentApp.
4. Postupne prechadzat zakomentovany kod a preklapat funkcionality.

















## Tables

1. skopirovat TableXXX.tsx do FC a original presunut do CC
2. Cely novy FC/TableXXX.tsx zakomentovat
3. Na zaciatok FC/TableXXX.tsx vlozit kod nizsie a "XXX" zamentit podla potreby:

```
import React from 'react'
import Translator from '@hubleto/react-ui/core/Translator';
import Table from '@hubleto/react-ui/components/fc/Table';
import { TableMeta, TableProps } from '@hubleto/react-ui/components/fc/TableInterfaces';
import FormXXX, { FormXXXProps } from './FormXXX';

interface TableXXXProps extends TableProps {
  // Delete or change, if your table shall be filterable
  // by some field. Check prepareReadQuery() in model's
  // record manager if appropriate filtering is applied.
  idSomeField?: number,
}

const componentName = 'TableXXX'; // must be the same as the exported const
const parentApp = 'Hubleto/App/Community/AppXXX';
const T = new Translator(parentApp + '/Loader', 'Components/' + componentName);

const TableXXX = (props: TableXXXProps) => {
  return <Table
    componentName={componentName}
    parentApp={parentApp}
    model={parentApp + '/Models/XXX'}
    endpointParams={{idSomeField: props.idSomeField}}
    formUrlSlug='parent-app-slug/same-url-slug-as-in-form'
    formModalProps={{type: 'right wide'}}
    formDefaultValues={{id_some_field: props.idSomeField}}
    // getRowClassName={(table: TableMeta, rowData: any): string => { return table.getDefaultRowClassName(rowData); }}
    // renderCell={(table: TableMeta, columnName: string, column: any, data: any, options: any) => { return table.renderDefaultCell(columnName, column, data, options); }}
    // renderActionsColumn={(table: TableMeta, row: any) => { return table.renderDefaultActionsColumn(row); }}
    // renderFooter={(table: TableMeta) => { return table.renderDefaultFooter(); }}
    renderForm={(table: TableMeta): React.JSX.Element => {
      return <FormXXX {...table.getDefaultFormProps()}/>;
    }}
    {...props}
  ></Table>
}

export default TableXXX;
```

3. Nastavit konstanty componentName a parentApp.
4. Postupne prechadzat zakomentovany kod a preklapat funkcionality.
5. V Loader.tsx appky upravit cestu importu tabulky - doplnit "FC/".